import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import polyfillNode from "rollup-plugin-polyfill-node";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["sockjs-client", "@stomp/stompjs"],
  },
  resolve: {
    alias: {
      global: "rollup-plugin-polyfill-node/polyfills/global",
      stream: "rollup-plugin-polyfill-node/polyfills/stream",
      buffer: "rollup-plugin-polyfill-node/polyfills/buffer",
    },
  },
  define: {
    global: "window",
  },
  server: {
    proxy: {
      "/ws": {
        target: "http://localhost:8081",
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [polyfillNode()],
    },
  },
});
