/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/EVOPROJECT',
  assetPrefix: '/EVOPROJECT/',
  reactStrictMode: true,
  images: {
    domains: ['scontent.fcai30-1.fna.fbcdn.net'],
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
