/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/lair',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;

