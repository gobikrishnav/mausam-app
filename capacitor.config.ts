import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.gov.imd.mausam',
  appName: 'Mausam',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'accounts.google.com',
      '*.accounts.google.com',
      '*.google.com',
      '*.googleusercontent.com',
      '*.gstatic.com',
      'apis.google.com',
      '*.clerk.accounts.dev',
      'more-marmoset-34.clerk.accounts.dev',
      '*.clerk.com',
      'clerk.com',
    ],
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#FFFFFF',
  },
};

export default config;
