import ResumeEditView from './resume-edit-view';

const ResumeEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> => {
  const { id } = await params;
  return <ResumeEditView resumeId={id} />;
};

export default ResumeEditPage;
