/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fitcareer.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fit-career.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cgrwvmaglmelswmojclc.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'k.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'k.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*.kakaocdn.net',
        pathname: '/dn/**',
      },
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net',
        pathname: '/dn/**',
      },
    ],
    disableStaticImages: true,
  },
};

export default nextConfig;
