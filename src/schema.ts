import * as fs from "fs";

import * as v from "valibot";

const ConfigSchema = v.record(
  v.string(),
  v.object({
    url: v.pipe(v.string(), v.url()),
    limit: v.number(),
  }),
);

export function parseConfig() {
  try {
    const rawData = fs.readFileSync("config.json", "utf-8");

    const config = v.parse(ConfigSchema, JSON.parse(rawData));

    return config;
  } catch (error) {
    console.error("Failed to parse config:", error);
  }
}
