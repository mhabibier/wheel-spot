/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow all local images from public/
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
