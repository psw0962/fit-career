export type HiringData = {
  id?: string;
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
  updated_at: string;
  created_at: string;
  address: string;
  address_search_key: string;
  position: string;
  title: string;
  content: string;
  dead_line: string;
  images: string[];
  user_id: string;
  short_address: string;
  period: number[];
  position_etc: boolean;
  is_visible: boolean;
  resume_received: {}[];
  enterprise_profile?: {
    id: string;
    user_id: string;
    name: string;
    address: string;
    address_search_key: string;
    description: string;
    logo: string[];
    establishment: string;
    industry: string;
    industry_etc: boolean;
  };
};

export type ResumeReceived = {
  id: string;
  name: string;
  email: string;
  links: {
    id: string;
    title: string;
    url: string;
  }[];
  phone: string;
  title: string;
  awards: {
    id: string;
    date: string;
    awardName: string;
  }[];
  status: 'pending' | 'accepted' | 'rejected';
  user_id: string;
  education: {
    id: string;
    startDate: string;
    endDate: string;
    isCurrentlyEnrolled: string;
    schoolName: string;
    majorAndDegree: string;
  }[];
  experience: {
    id: string;
    startDate: string;
    endDate: string;
    isCurrentlyEmployed: boolean;
    companyName: string;
    jobTitle: string;
    description: string;
  }[];
  updated_at: string;
  certificates: {
    id: string;
    date: string;
    certificateName: string;
  }[];
  introduction: string;
  resume_image: string[];
  submitted_at: string;
  upload_resume: string | 'NULL';
  is_fitcareer_resume: boolean;
};
