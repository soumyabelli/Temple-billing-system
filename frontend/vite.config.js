import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Touch comment to trigger reload
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000"
    }
  }
});