/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

/** @param {{ config: Record<string, unknown> }} param0 */
module.exports = ({ config }) => ({
  expo: {
    ...config,
    extra: {
      ...(config.extra || {}),
      apiUrl: process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL_PROD || '',
      apiKey: process.env.EXPO_PUBLIC_API_KEY || '',
    },
  },
});
