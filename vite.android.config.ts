import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: resolve(projectRoot, "android-web"),
  publicDir: resolve(projectRoot, "public"),
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: resolve(projectRoot, "dist-android"),
    emptyOutDir: true,
  },
});
