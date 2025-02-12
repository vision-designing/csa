import { defineConfig, squooshImageService } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import awsAmplify from "astro-aws-amplify";

export default defineConfig({
  site: "https://www.criticalsystemsanalysis.com",
  output: "hybrid",
  adapter: awsAmplify(),
  integrations: [sitemap()],
  image: {
    service: squooshImageService(),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
