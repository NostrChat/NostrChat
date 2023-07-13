import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.nostrchat.app',
  appName: 'NostrChat',
  webDir: 'build',
  backgroundColor: '#141414',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
