import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: [
        "art-cincinnati-anne-assessments.trycloudflare.com",
        "traditions-gzip-act-authorized.trycloudflare.com",
        "phapmontamlinh-quantheambotat.vn",
        "strapi.phapmontamlinh-quantheambotat.vn"
      ],
    },
  });
};
