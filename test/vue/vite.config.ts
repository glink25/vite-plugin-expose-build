import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ExposeBuild } from '../../src';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // base: './test/vue',
  plugins: [
    vue(),
    ExposeBuild({
      entries: { index: 'index.html', external: 'external.html' },
      domain: 'http://localhost:8877',
      hostCSS: ['**/global-style.css', '**/style.css'],
      mode: 'shadowRoot',
    }),
  ],
  resolve: {
    alias: {
      'expose-build': resolve('../../src'),
    },
  },
});
