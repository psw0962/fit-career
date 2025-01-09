import HiringEditView from './hiring-edit-view';

const HiringEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> => {
  const { id } = await params;
  return <HiringEditView hiringId={id} />;
};

export default HiringEditPage;
