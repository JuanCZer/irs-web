const apiTarget =
  process.env.IRS_API_PROXY_TARGET || 'https://localhost:5001';

module.exports = {
  '/api': {
    target: apiTarget,
    secure: false,
    changeOrigin: true,
  },
};
