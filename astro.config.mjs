import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import awsAmplify from "astro-aws-amplify";

export default defineConfig({
  site: "https://www.criticalsystemsanalysis.com",
  output: "static",
  adapter: awsAmplify(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
