// next.config.js
const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withSentryConfig(nextConfig, {
  // Organisation et projet Sentry
  org: "visarun-71",
  project: "javascript-nextjs",

  // Silence les logs Sentry au build — moins de bruit dans Vercel
  silent: true,

  // Désactive le upload des source maps (nécessite un token — pas utile sur free plan)
  sourcemaps: {
    disable: true,
  },
});
