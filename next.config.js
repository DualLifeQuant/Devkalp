/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  // Sentry source maps in production
  ...(process.env.NEXT_PUBLIC_SENTRY_DSN
    ? {
        sentry: {
          hideSourceMaps: true,
          tunnelRoute: '/monitoring',
        },
      }
    : {}),
}

module.exports = nextConfig
