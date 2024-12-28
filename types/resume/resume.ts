export type ResumeData = {
  id?: string;
  title: string;
  resumeImage: File[];
  currentResumeImage?: string;
  name: string;
  phone: string;
  email: string;
  introduction: string;
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
  certificates: {
    id: string;
    date: string;
    certificateName: string;
  }[];
  awards: {
    id: string;
    date: string;
    awardName: string;
  }[];
  links: {
    id: string;
    title: string;
    url: string;
  }[];
  upload_resume?: string;
  is_fitcareer_resume?: boolean;
  updated_at?: string;
};

export type ResumeDataResponse = {
  id: string;
  user_id: string;
  title: string;
  resume_image: string[];
  currentResumeImage?: string;
  name: string;
  phone: string;
  email: string;
  introduction: string;
  education: Education[];
  experience: Experience[];
  certificates: Certificate[];
  awards: Award[];
  links: LinkData[];
  upload_resume?: string | null;
  is_fitcareer_resume?: boolean;
  updated_at: string;
};

export type LinkData = {
  id: string;
  title: string;
  url: string;
};

export type Education = {
  id: string;
  startDate: string;
  endDate: string;
  isCurrentlyEnrolled: string;
  schoolName: string;
  majorAndDegree: string;
};

export type Experience = {
  id: string;
  startDate: string;
  endDate: string;
  isCurrentlyEmployed: boolean;
  companyName: string;
  jobTitle: string;
  description: string;
};

export type Certificate = {
  id: string;
  date: string;
  certificateName: string;
};

export type Award = {
  id: string;
  date: string;
  awardName: string;
};
