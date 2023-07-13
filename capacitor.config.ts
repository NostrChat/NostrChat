import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.nostrchat.app',
  appName: 'NostrChat',
  webDir: 'build',
  backgroundColor: '#343434',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false
  }
};

export default config;
