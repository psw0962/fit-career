import { User, Provider } from '@supabase/supabase-js';

export type SignInResponse = { provider: Provider; url: string };

export type EnterpriseProfile = {
  name: string;
  industry: {
    job: string;
    etc?: string;
  };
  establishment: string;
  address: {
    zoneCode: string;
    zoneAddress: string;
    detailAddress: string;
  };
  description: string;
  settingLogo?: File[];
  currentLogo?: string;
};
