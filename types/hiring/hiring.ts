export type HiringData = {
  address: {
    zoneCode: string;
    zoneAddress: string;
    detailAddress: string;
  };
  position: {
    job: string;
    etc?: string;
  };
  periodValue: number[];
  title: string;
  content: string;
  deadLine: string;
  images: File[];
  enterprise_name: string;
  enterprise_logo: string;
  enterprise_establishment: string;
  enterprise_description: string;
};

export type HiringDataProps = {
  id: string;
  created_at: string;
  address: string;
  position: string;
  position_etc: boolean;
  period: number[];
  title: string;
  content: string;
  dead_line: string;
  images: string[];
  short_address: string;
  user_id: string;
  enterprise_name: string;
  enterprise_logo: string;
  enterprise_establishment: string;
  enterprise_description: string;
};
