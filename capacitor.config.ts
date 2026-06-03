import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quran.testcreator',
  appName: 'اختبارات القرآن',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#061225',
      showSpinner: false,
    },
  },
  android: {
    backgroundColor: '#061225',
  },
};

export default config;
