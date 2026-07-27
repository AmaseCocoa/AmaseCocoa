import { defineConfig, type TsdownPlugin } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  unbundle: true,
});
