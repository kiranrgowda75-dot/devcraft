/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'youtu.be' },
      { protocol: 'https', hostname: 'youtube.com' },
      { protocol: 'https', hostname: 'www.youtube.com' },
      { protocol: 'https', hostname: 'ik.imagekit.io' },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://spring-boot-production-6abb.up.railway.app'
      : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
