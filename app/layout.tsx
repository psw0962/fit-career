import type { Metadata } from 'next';
import '../public/styles/global.css';
import Nav from '@/components/common/nav';
import Footer from '@/components/common/footer';
import ReactQueryClientProvider from '@/config/ReactQueryClientProvider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { pretendard } from './fonts';

export const metadata: Metadata = {
  title: '피트니스의 모든 정보, FIT Career',
  description:
    '취업, 이직, 커리어 콘텐츠, 중고 거래, 대회 정보까지 피트니스 정보의 모든 것',
  metadataBase: new URL('https://fitcareer.co.kr'),
  openGraph: {
    title: '피트니스의 모든 정보, FIT Career',
    description:
      '취업, 이직, 커리어 콘텐츠, 중고 거래, 대회 정보까지 피트니스 정보의 모든 것',
    images: [
      {
        url: '/svg/logo.svg',
        width: 1200,
        height: 630,
        alt: 'FIT Career',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'ndn4FMya7bUSd8ctl7COuwNbihONM0hLrXvacHiHPX4',
    other: {
      'naver-site-verification': '411c6cdc24af411d5a2bac4b9e8bd58eabc8a92e',
    },
  },
  alternates: {
    canonical: 'https://fitcareer.co.kr',
  },
  icons: '/favicon.ico',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ReactQueryClientProvider>
      <html lang="ko" className={pretendard.variable}>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <meta
            name="naver-site-verification"
            content="411c6cdc24af411d5a2bac4b9e8bd58eabc8a92e"
          />
          <meta
            name="google-site-verification"
            content="ndn4FMya7bUSd8ctl7COuwNbihONM0hLrXvacHiHPX4"
          />
          <link rel="icon" href="/favicon.ico" />
        </head>

        <body
          className="overflow-x-auto font-sans antialiased"
          suppressHydrationWarning={true}
        >
          <div className="flex flex-col min-w-[350px] min-h-screen">
            <Nav />

            <main className="flex-grow w-full max-w-7xl mx-auto px-3 sm:px-10 pt-16 sm:pt-20 pb-16">
              {children}
              <Analytics />
            </main>

            <Toaster />

            <Footer />
          </div>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
};

export default RootLayout;
