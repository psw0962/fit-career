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
};

export type HiringDataResponse = {
  id: string;
  created_at: string;
  address: string;
  position: string;
  title: string;
  content: string;
  dead_line: string;
  images: string[];
  user_id: string;
  short_address: string;
  period: number[];
  position_etc: boolean;
  resume_received: string[];
  enterprise_profile?: {
    id: string;
    user_id: string;
    name: string;
    address: string;
    description: string;
    logo: string[];
    establishment: string;
    industry: string;
    industry_etc: boolean;
  };
};
