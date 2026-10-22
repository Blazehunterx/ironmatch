import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ironmatch.app',
  appName: 'IronMatch',
  webDir: 'dist',
  server: {
    hostname: 'ironmatch.app',
    androidScheme: 'https'
  }
};

export default config;
