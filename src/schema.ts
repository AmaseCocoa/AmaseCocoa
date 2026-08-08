import * as fs from "node:fs";

import * as v from "valibot";

export const ArtistSchema = v.object({
  artist_credit_name: v.string(),
  artist_mbid: v.string(),
  join_phrase: v.string(),
});

export const RecordingSchema = v.object({
  artist_mbids: v.array(v.string()),
  artist_name: v.string(),
  artists: v.array(ArtistSchema),
  caa_id: v.number(),
  caa_release_mbid: v.string(),
  listen_count: v.number(),
  recording_mbid: v.string(),
  release_mbid: v.string(),
  release_name: v.string(),
  track_name: v.string(),
});

export const PayloadSchema = v.object({
  count: v.number(),
  from_ts: v.number(),
  last_updated: v.number(),
  offset: v.number(),
  range: v.string(),
  recordings: v.array(RecordingSchema),
  to_ts: v.number(),
  total_recording_count: v.number(),
  user_id: v.string(),
});

export const ResponseSchema = v.object({
  payload: PayloadSchema,
});

const lastFmTrack = v.object({
  name: v.string(),
  url: v.string(),
  artist: v.object({
    url: v.string(),
    name: v.string()
  }),
  playcount: v.pipe(v.string(), v.toNumber())
})

const lastFmTopTracks = v.object({
  track: v.array(lastFmTrack)
})

export const LastFmResponseSchema = v.object({
  toptracks: lastFmTopTracks
})

export type LastFmResponseData = v.InferOutput<typeof LastFmResponseSchema>;
export type ResponseData = v.InferOutput<typeof ResponseSchema>;

const ConfigSchema = v.object({
  lastfm: v.object({
    enable: v.boolean(),
    username: v.optional(v.string(), process.env.LASTFM_USERNAME ?? ''),
    period: v.optional(v.picklist(['overall', '7day', '1month', '3month','6month','12month']), 'overall'),
    count: v.optional(v.number())
  }),
  listenbrainz: v.object({
    enable: v.boolean(),
    username: v.optional(v.string(), process.env.LISTENBRAINZ_USERNAME ?? ''),
    range: v.optional(v.string()),
    count: v.optional(v.number())
  }),
  feed: v.object({
    enable: v.boolean(),
    config: v.record(
      v.string(),
      v.object({
        url: v.pipe(v.string(), v.url()),
        limit: v.number(),
      }),
    ),
  }),
});

export function parseConfig() {
  try {
    const rawData = fs.readFileSync("config.json", "utf-8");

    const config = v.parse(ConfigSchema, JSON.parse(rawData));

    return config;
  } catch (error) {
    console.error("Failed to parse config:", error);
  }
}
