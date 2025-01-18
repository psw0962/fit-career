import type { Metadata } from 'next';
import '../public/styles/global.css';
import Nav from '@/components/common/nav';
import Footer from '@/components/common/footer';
import ReactQueryClientProvider from '@/config/ReactQueryClientProvider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: '피트니스의 모든 정보, FIT Career',
  description:
    '취업, 이직, 커리어 콘텐츠, 중고 거래, 대회 정보까지 피트니스 정보의 모든 것',
  icons: '/favicon.ico',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        </head>

        <body className="overflow-x-auto" suppressHydrationWarning={true}>
          <div className="flex flex-col min-w-[350px] min-h-screen">
            <Nav />

            <main className="flex-grow w-full max-w-7xl mx-auto px-3 sm:px-10 pt-16 sm:pt-20 pb-16">
              {children}
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
