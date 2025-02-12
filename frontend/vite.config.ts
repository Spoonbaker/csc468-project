import type { UserConfig } from 'vite'

export default {
  css: {
    transformer: 'lightningcss',
    lightningcss: { },
  },
  build: {
    cssMinify: 'lightningcss',
  },
} satisfies UserConfig;

