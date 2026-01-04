import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';
import packageJson from './package.json';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  env: {
    APP_VERSION: packageJson.version,
  },
};

export default withPWA(nextConfig);
