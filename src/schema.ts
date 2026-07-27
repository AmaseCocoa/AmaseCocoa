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

export type ResponseData = v.InferOutput<typeof ResponseSchema>;

const ConfigSchema = v.object({
  listenbrainz: v.object({
    enable: v.boolean(),
    username: v.string(),
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
