import localFont from 'next/font/local';

export const pretendard = localFont({
  src: [
    {
      path: '../public/fonts/PretendardLight.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/PretendardMedium.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/PretendardBold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-pretendard',
});
