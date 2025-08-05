import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fceda081a17947afa3e23e70e01e5352',
  appName: 'retro-routine-zone',
  webDir: 'dist',
  server: {
    url: 'https://fceda081-a179-47af-a3e2-3e70e01e5352.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ["camera", "photos"]
    }
  }
};

export default config;