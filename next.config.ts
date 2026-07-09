import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
}

// next-pwa only applied in production build, skipped in dev with Turbopack
if (process.env.NODE_ENV === 'production') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  })
  module.exports = withPWA(nextConfig)
} else {
  module.exports = nextConfig
}
