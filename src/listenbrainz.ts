import * as v from "valibot";
import { parseConfig, ResponseSchema } from "./schema";

const config = parseConfig();

async function getRecentMusic(userName: string) {
  const result = await fetch(
    `https://api.listenbrainz.org/1/stats/user/${userName}/recordings?range=${config?.listenbrainz.range}&count=${config?.listenbrainz.count}`,
    {
      method: "GET",
      headers: {
        Authorization: process.env.LISTENBRAINZ_TOKEN
          ? `Token ${process.env.LISTENBRAINZ_TOKEN}`
          : "",
      },
    },
  );
  if (result.status === 200) {
    const rawData = await result.json();
    const parsedData = v.safeParse(ResponseSchema, rawData);
    if (!parsedData.success) {
      throw Error(`${parsedData.issues}`);
    }

    return {
      success: true,
      data: parsedData,
    };
  } else if (result.status === 204) {
    return {
      success: true,
      data: null,
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

  const data = result.data?.output.payload

  const baseTable = `| Artist | Track |
| ---- | ---- |`;
  let tableElem: string[] = [];

  data?.recordings.map((d) => {
    let artists: string[] = [];
    d.artists.map((artist) => {
      artists.push(
        `[${artist.artist_credit_name}](https://listenbrainz.org/artist/${artist.artist_mbid})`,
      );
    });
    tableElem.push(
      `| ${artists.join(",")} | [${d.track_name}](https://listenbrainz.org/track/${d.recording_mbid}) |`,
    );
  });

  return baseTable + "\n" + tableElem.join("\n");
}
