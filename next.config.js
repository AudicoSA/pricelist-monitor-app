/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  },
  async rewrites() {
    return [
      {
        source: '/opencart-admin/:path*',
        destination: '/api/auth/:path*'
      }
    ];
  }
}

module.exports = nextConfig
