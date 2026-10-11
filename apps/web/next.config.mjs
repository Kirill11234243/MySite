const config = process.env.STATIC_EXPORT === '1'
  ? { output: 'export', trailingSlash: true }
  : {};
export default config;
