import dynamic from 'next/dynamic';

const HiringMain = dynamic(() => import('@/components/hiring/hiring-main'));

// export const metadata = {
//   title: 'HOME',
//   description: 'HOME',
// };

// export async function generateMetadata({ params, searchParams }) {
//   const movie = await getMovie(params.id);

//   return {
//     title: movie.title,
//     description: movie.overview,
//     openGraph: {
//       images: [movie.image_url],
//     },
//   };
// }

export default function Home() {
  return <HiringMain />;
}
