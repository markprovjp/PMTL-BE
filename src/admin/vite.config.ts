import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    server: {
      host: '0.0.0.0',
      allowedHosts: [
        "art-cincinnati-anne-assessments.trycloudflare.com",
        "traditions-gzip-act-authorized.trycloudflare.com"
      ],
    },
  });
};
