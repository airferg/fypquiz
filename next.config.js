/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  images: {
    domains: ['ztwvnoxfeqinzgygbedr.supabase.co'],
  },
  // Increase body size limit for video uploads
  api: {
    bodyParser: {
      sizeLimit: '250mb',
    },
    responseLimit: false,
  },
}

module.exports = nextConfig 