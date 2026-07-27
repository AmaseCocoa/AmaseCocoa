import * as v from "valibot";
import { ResponseSchema } from "./schema";

async function getRecentMusic(userName: string) {
  const result = await fetch(
    `https://api.listenbrainz.org/1/stats/user/${userName}/recordings?range=week&count=2`,
    {
      method: "GET",
      headers: {
        Authorization: `Token {}`,
      },
    },
  );
  if (result.status === 200) {
    const rawData = await result.json();
    const parsedData = v.safeParse(ResponseSchema, rawData);
    if (!parsedData.success) {
        throw Error(`${parsedData.issues}`)
    }

    return parsedData
  }

  return null
}

export async function renderMarkdown(username: string) {
    const data = await getRecentMusic(username);

    if (!data) {
        return `データの取得に失敗しました`
    }

    const baseTable = `| Artist | Track |
| ---- | ---- |`;
    let tableElem: string[] = [];

    data.output.payload.recordings.map((d) => {
        let artists: string[] = [];
        d.artists.map((artist) => {
            artists.push(`[${artist.artist_credit_name}](https://listenbrainz.org/artist/${artist.artist_mbid})`)
        })
        tableElem.push(`| ${artists.join(',')} | [${d.track_name}](https://listenbrainz.org/track/${d.recording_mbid}) |`)
    })

    return baseTable + "\n" + tableElem.join('\n')
}
