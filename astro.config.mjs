import { defineConfig, passthroughImageService } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import awsAmplify from "astro-aws-amplify";

export default defineConfig({
  site: "https://www.criticalsystemsanalysis.com",
  adapter: awsAmplify(),
  integrations: [sitemap()],
  image: {
    service: passthroughImageService(),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
