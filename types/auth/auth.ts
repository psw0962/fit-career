import { Provider } from '@supabase/supabase-js';

export interface SignInResponse {
  provider: Provider;
  url: string;
}

export interface EnterpriseProfile {
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
  address_search_key: string;
  description: string;
  settingLogo?: File[];
  currentLogo?: string;
}
