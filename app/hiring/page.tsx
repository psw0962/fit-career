import HiringMain from '@/components/hiring/hiring-main';

export const dynamic = 'force-static';
export const revalidate = false;

export default function Hiring() {
  return <HiringMain />;
}
