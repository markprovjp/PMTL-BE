export default ({ env }: any) => ({
  autogenerate: env.bool('TYPESCRIPT_AUTOGEN_ENABLED', true),
});
