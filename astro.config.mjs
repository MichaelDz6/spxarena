import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://spxarena.com',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    server: {
      allowedHosts: ['foveate-unsickered-rigoberto.ngrok-free.dev'],
    },
  },
  integrations: [
    {
      name: 'isolated-vite-caches',
      hooks: {
        'astro:config:setup': ({ command, updateConfig }) => {
          // Building while dev is running must not replace its optimized modules.
          updateConfig({ vite: { cacheDir: `node_modules/.vite/${command}` } });
        },
      },
    },
  ],
});
