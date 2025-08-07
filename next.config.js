/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  images: {
    domains: ['ztwvnoxfeqinzgygbedr.supabase.co'],
  },
}

module.exports = nextConfig 