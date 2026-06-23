/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['scontent.fcai30-1.fna.fbcdn.net'],
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
