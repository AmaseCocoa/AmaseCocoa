import * as v from "valibot";
import { parseConfig, LastFmResponseSchema } from "./schema";

const config = parseConfig();

async function getRecentMusic(userName: string) {
  const result = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${userName}&api_key=${process.env.LASTFM_API_KEY}&period=${config?.lastfm.period}&limit=${config?.lastfm.count}&format=json`,
    {
      method: "GET",
      headers: {
        'User-Agent': 'ProfileUpdater/0.1.0 (https://github.com/AmaseCocoa/AmaseCocoa)'
      },
    },
  );
  if (result.status === 200) {
    const rawData = await result.json();
    const parsedData = v.safeParse(LastFmResponseSchema, rawData);
    if (!parsedData.success) {
      throw Error(v.summarize(parsedData.issues));
    }

    return {
      success: true,
      data: parsedData.output,
    };
  }

  return {
    success: false,
    data: null,
  };
}

export async function renderMarkdown(username: string) {
  const result = await getRecentMusic(username);

  if (!result.success && !result.data) {
    return `データの取得に失敗しました`;
  } else if (result.success && !result.data) {
    return `データなし`
  }

  const data = result.data?.toptracks.track ?? []

  const baseTable = `| Artist | Track |
| ---- | ---- |`;
  let tableElem: string[] = [];

  data.map((d) => {
    let artists: string[] = [];
    artists.push(
      `[${d.artist.name}](${d.artist.url})`,
    );
    tableElem.push(
      `| ${artists.join(",")} | [${d.name}](${d.url}) |`,
    );
  });

  return baseTable + "\n" + tableElem.join("\n");
}
