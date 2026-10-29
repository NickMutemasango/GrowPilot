import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        // Only run on our own CSS. `foreign` alone doesn't exclude next/font's
        // generated CSS, which the Tailwind loader breaks.
        condition: {
          all: [{ not: "foreign" }, { path: /^(app|components|lib)\// }],
        },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
