import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

import type { UserConfig } from "vite";
import { imagetools } from "vite-imagetools";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// From https://github.com/codyebberson/wglt/blob/5d397e89cc3389895a74adb2ac6a562f68dc5c36/vite.config.ts#L12-L14
const htmlFiles = globSync("./*.html"); // FIXME: we shouldn't depend on glob
const input = Object.fromEntries(
  htmlFiles.map((file) => [file.replace("./", ""), resolve(__dirname, file)]),
);
export default {
  resolve: {
    extensions: [], // We want imports to be exact and unambiguous
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {}, // TODO: sourcemaps in dev mode?
  },
  build: {
    cssMinify: "lightningcss",
    rollupOptions: {
      input,
    },
  },
  plugins: [
    imagetools({
      defaultDirectives: new URLSearchParams({
        format: "webp",
      }),
    }),
    tailwindcss(),
  ],
  server: {
    headers: {
      "Content-Security-Policy": "default-src 'self'; img-src https://*",
    },
  },
} satisfies UserConfig;
