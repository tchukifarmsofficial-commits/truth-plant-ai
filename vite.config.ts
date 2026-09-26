import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        entry: "server",
      },
    }),
    netlify(),
    viteReact(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Tchuki Farms Plant Doctor AI",
        short_name: "Tchuki Plant Doctor",
        description:
          "AI-powered plant diagnosis and farming assistant by Tchuki Farms.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/tchuki-farms-logo-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/tchuki-farms-logo-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});