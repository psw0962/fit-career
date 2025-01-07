import HiringDetailView from './hiring-detail-view';

const HiringPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> => {
  const { id } = await params;
  return <HiringDetailView hiringId={id} />;
};

export default HiringPage;
