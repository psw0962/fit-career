import * as React from 'react';
import BasicCarousel from '@/components/carousel/basic-carousel';

export const metadata = {
  title: 'HOME',
  description: 'HOME',
};

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

const Home = () => {
  return (
    <main>
      <div>
        <BasicCarousel />

        <p className="text-3xl pt-20 pb-5">{`채용 >`}</p>

        <div className="grid gap-4 grid-cols-4 mb-36">
          <div className="border py-10 px-10 rounded-xl">test</div>
          <div className="border py-10 px-10 rounded-xl">test</div>
          <div className="border py-10 px-10 rounded-xl">test</div>
          <div className="border py-10 px-10 rounded-xl">test</div>
        </div>
      </div>
    </main>
  );
};

export default Home;
