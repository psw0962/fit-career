export const calculateYearsInBusiness = (data: string) => {
  if (!data) {
    return null;
  }

  const establishmentYear = parseInt(data.split('-')[0], 10);
  const currentYear = new Date().getFullYear();
  return Math.max(currentYear - establishmentYear + 1, 0);
};
