import { defineConfig } from "@trigger.dev/sdk/v3";
import { additionalFiles } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_hacafwcysqmysmtfijhg",
  runtime: "node",
  logLevel: "log",
  maxDuration: 60,
  legacyDevProcessCwdBehaviour: false,
  dirs: ["./src/trigger"],
  build: {
    extensions: [additionalFiles({ files: ["./src/workflows/**"] })],
  },
});
