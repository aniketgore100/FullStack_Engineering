import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // same-origin in dev: the httpOnly refresh cookie just works, no CORS
    proxy: { "/api": "http://localhost:8000" },
  },
});
