import type { Metadata } from 'next';
import '../public/styles/global.css';
import Nav from '@/components/common/nav';
import Footer from '@/components/common/footer';
import ReactQueryClientProvider from '@/config/ReactQueryClientProvider';

export const metadata: Metadata = {
  title: '피트니스의 모든 정보, FIT Career',
  description: '취업, 이직, 커리어 콘텐츠까지 피트니스 커리어 성장의 모든 것',
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
        <head></head>

        <body className="overflow-x-auto">
          <div className="min-w-[350px]">
            <Nav />

            <div className="max-w-7xl mx-auto px-10 py-32">
              <div className="">{children}</div>
            </div>

            <Footer />
          </div>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
};

export default RootLayout;
