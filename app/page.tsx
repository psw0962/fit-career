import dynamic from 'next/dynamic';

const HiringMain = dynamic(() => import('@/components/hiring/hiring-main'));

export default function Home() {
  return <HiringMain />;
}
