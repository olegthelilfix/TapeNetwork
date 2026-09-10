import path from "node:path";

// @dx-display/widgets-heatmap's dependency tree ships @dx-display/injectable-react,
// @dx-display/frp-ts-react and styled-components as ~10-14 separately nested copies
// instead of one hoisted install (each package.json pins the same exact version, but
// yarn still nests them — see @dx-display/utils-react/lib/injectable.esm.js, whose
// Dependencies.Provider is a re-export of injectable-react's DependenciesProvider).
// injectable-react's DependenciesProvider owns the actual React Context; with multiple
// physically distinct copies, a provider from one copy is invisible to a consumer
// (e.g. shared-ui-i18n's useIntl) resolved from another, throwing
// 'Missing dependency: "i18n-intl-object"' at runtime. Forcing all of them to resolve
// to one canonical copy restores the single-instance assumption the widget relies on.
const DX_DISPLAY_SINGLETON_ALIASES = ["@dx-display/injectable-react", "@dx-display/frp-ts-react", "styled-components"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    // Prototype assets + future media host; tighten in production.
    remotePatterns: [{ protocol: "http", hostname: "**" }, { protocol: "https", hostname: "**" }],
  },
  webpack: (config) => {
    for (const name of DX_DISPLAY_SINGLETON_ALIASES) {
      config.resolve.alias[name] = path.resolve(
        `./node_modules/@dx-display/widgets-core/node_modules/${name}`,
      );
    }
    return config;
  },
};

export default nextConfig;
