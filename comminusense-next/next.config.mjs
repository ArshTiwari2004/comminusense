/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // <-- this is critical for Vercel routing
  distDir: '.next', // ensures build output stays in .next folder

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
