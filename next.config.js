/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@mollie/api-client', 'bull'],
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
