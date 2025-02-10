import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [128, 160, 256, 384, 512, 640, 768, 1024, 1200, 1920],
    imageSizes: [64, 96, 128, 160, 256, 384, 512, 640, 768, 1024, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fitcareer.co.kr',
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
        pathname: '/thumb/**',
      },
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net',
        pathname: '/thumb/**',
      },
    ],
  },
};

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzerConfig(nextConfig);
