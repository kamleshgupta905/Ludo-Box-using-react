import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ludofeel.app",
  appName: "Ludo Feel",
  webDir: ".output/public",
  server: { androidScheme: "https" },
};

export default config;
