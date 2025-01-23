import type { Metadata } from 'next';
import '../public/styles/global.css';
import Nav from '@/components/common/nav';
import Footer from '@/components/common/footer';
import ReactQueryClientProvider from '@/config/ReactQueryClientProvider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { pretendard } from './fonts';
import { Suspense } from 'react';
import GlobalSpinner from '@/components/common/global-spinner';

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export const metadata: Metadata = {
  title: '핏커리어(FIT Career) - 피트니스의 모든 정보',
  description:
    '핏커리어(FIT Career)에서 피트니스 취업, 이직, 커리어 콘텐츠, 중고 거래, 대회 정보를 확인하세요.',
  keywords:
    '핏커리어, fitcareer, 취업, 이직, 커리어, 중고 거래, 대회, 피트니스 정보, 피트니스 커리어, 피트니스 취업, 피트니스 이직, 피트니스 커리어 콘텐츠, 피트니스 중고 거래, 피트니스 대회 정보',
  metadataBase: new URL('https://fitcareer.co.kr'),
  openGraph: {
    title: '핏커리어(FIT Career) - 피트니스의 모든 정보',
    description:
      '핏커리어(FIT Career)에서 피트니스 취업, 이직, 커리어 콘텐츠, 중고 거래, 대회 정보를 확인하세요.',
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
  verification: {
    google: 'ndn4FMya7bUSd8ctl7COuwNbihONM0hLrXvacHiHPX4',
    other: {
      'naver-site-verification': '411c6cdc24af411d5a2bac4b9e8bd58eabc8a92e',
      'google-adsense-account': 'ca-pub-2830847395912425',
    },
  },
  alternates: {
    canonical: 'https://fitcareer.co.kr',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon-152x152.png', sizes: '152x152' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '핏커리어(FIT Career)',
  alternateName: 'fitcareer',
  url: 'https://fitcareer.co.kr',
  description:
    '핏커리어(FIT Career)에서 피트니스 취업, 이직, 커리어 콘텐츠, 중고 거래, 대회 정보를 확인하세요.',
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>

        <body
          className="overflow-x-auto font-sans antialiased"
          suppressHydrationWarning={true}
        >
          <div className="flex flex-col min-w-[350px] min-h-screen">
            <Nav />

            <Suspense fallback={<GlobalSpinner />}>
              <main
                className="flex-grow w-full max-w-7xl mx-auto px-3 sm:px-10 pt-16 sm:pt-20 pb-16"
                style={{
                  containIntrinsicSize: '0 500px',
                  contentVisibility: 'auto',
                }}
              >
                {children}
              </main>
            </Suspense>

            <Toaster />

            <Footer />
          </div>

          <Analytics />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
};

export default RootLayout;
