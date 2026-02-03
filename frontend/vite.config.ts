import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // bind to all addresses (so ngrok can reach it)
    host: true, // same as host: '0.0.0.0'
    port: 5174, // or whatever port you’re using

    // whitelist your specific ngrok hostname:
    allowedHosts: ["168c4e0a399f.ngrok-free.app"],
  },
});
