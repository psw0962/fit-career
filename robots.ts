import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://fitcareer.co.kr/sitemap.xml',
    host: 'https://fitcareer.co.kr',
  };
}
