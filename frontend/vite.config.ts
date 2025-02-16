import type { UserConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

export default {
  resolve: {
    extensions: [], // We want imports to be exact and unambiguous
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {}, // TODO: sourcemaps in dev mode?
  },
  build: {
    cssMinify: 'lightningcss',
  },
  plugins: [
    imagetools({
      defaultDirectives: new URLSearchParams({
        format: "webp",
      })
    }),
  ],
} satisfies UserConfig;

