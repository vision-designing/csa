import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://www.criticalsystemsanalysis.com",
  adapter: vercel(),
  integrations: [sitemap()],
  image: {
    domains: ["images.ctfassets.net"],
  },
  experimental: {
    responsiveImages: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
