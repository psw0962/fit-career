/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cgrwvmaglmelswmojclc.supabase.co',
      'http://127.0.0.1:3000',
      'k.kakaocdn.net',
    ],
    disableStaticImages: true,
  },
};

export default nextConfig;
