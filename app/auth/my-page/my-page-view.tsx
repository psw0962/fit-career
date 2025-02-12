'use client';

import dynamic from 'next/dynamic';
import * as Tabs from '@radix-ui/react-tabs';
import { useEffect, useRef } from 'react';
import { useSessionStorage } from 'usehooks-ts';
import { useGetEnterpriseProfile, useGetUserData } from '@/actions/auth';
import GlobalSpinner from '@/components/common/global-spinner';
import { useRouter } from 'next/navigation';

const Profile = dynamic(() => import('@/components/my-page/profile'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});
const EnterpriseProfile = dynamic(
  () => import('@/components/my-page/enterprise-profile'),
  { loading: () => <GlobalSpinner />, ssr: false }
);
const ResumeList = dynamic(
  () => import('@/components/my-page/resume/resume-list'),
  { loading: () => <GlobalSpinner />, ssr: false }
);
const ResumeSubmitted = dynamic(
  () => import('@/components/my-page/resume/resume-submitted'),
  { loading: () => <GlobalSpinner />, ssr: false }
);
const HiringPosts = dynamic(
  () => import('@/components/my-page/hiring/hiring-posts'),
  { loading: () => <GlobalSpinner />, ssr: false }
);
const BookmarksHiring = dynamic(
  () => import('@/components/my-page/bookmarks-hiring'),
  { loading: () => <GlobalSpinner />, ssr: false }
);

export default function MyPageView() {
  const router = useRouter();
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [activeTab, setActiveTab] = useSessionStorage('activeTab', 'profile');

  const { data: userData, isLoading: isUserDataLoading } = useGetUserData();
  const { data: enterpriseProfileData, isLoading: isEnterpriseProfileLoading } =
    useGetEnterpriseProfile(userData?.id ?? '');

  const getClassName = (value: string) => {
    return `px-2 py-1 text-sm ${
      activeTab === value
        ? 'border-2 rounded border-[#4C71C0] z-10'
        : 'border-2 rounded border-transparent text-[#C3C4C5] z-0'
    }`;
  };

  useEffect(() => {
    const activeTabRef = tabRefs.current[activeTab];
    if (activeTabRef) {
      activeTabRef.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeTab]);

  if (isUserDataLoading || isEnterpriseProfileLoading) {
    return <GlobalSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-2xl font-bold underline underline-offset-4 decoration-[#4C71C0]">
          마이페이지
        </p>
      </div>

      <Tabs.Root
        className="pt-4"
        defaultValue={activeTab}
        onValueChange={(value) => setActiveTab(value)}
      >
        <Tabs.List className="relative flex whitespace-nowrap overflow-auto pb-2">
          <Tabs.Trigger
            ref={(el) => {
              tabRefs.current['profile'] = el;
            }}
            className={getClassName('profile')}
            value="profile"
          >
            프로필
          </Tabs.Trigger>

          <Tabs.Trigger
            ref={(el) => {
              tabRefs.current['enterprise'] = el;
            }}
            className={getClassName('enterprise')}
            value="enterprise"
          >
            기업 프로필
          </Tabs.Trigger>

          <Tabs.Trigger
            ref={(el) => {
              tabRefs.current['resume'] = el;
            }}
            className={getClassName('resume')}
            value="resume"
          >
            내 이력서
          </Tabs.Trigger>

          <Tabs.Trigger
            ref={(el) => {
              tabRefs.current['submitted'] = el;
            }}
            className={getClassName('submitted')}
            value="submitted"
          >
            지원한 채용공고
          </Tabs.Trigger>

          <Tabs.Trigger
            ref={(el) => {
              tabRefs.current['bookmarks-hiring'] = el;
            }}
            className={getClassName('bookmarks-hiring')}
            value="bookmarks-hiring"
          >
            북마크한 채용공고
          </Tabs.Trigger>

          {enterpriseProfileData && enterpriseProfileData.length > 0 && (
            <Tabs.Trigger
              ref={(el) => {
                tabRefs.current['employment'] = el;
              }}
              className={getClassName('employment')}
              value="employment"
            >
              등록한 채용공고
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <div className="w-full h-[1px] mt-2 bg-gray-200" />

        <div>
          <Tabs.Content value="profile">
            <Profile />
          </Tabs.Content>

          <Tabs.Content value="enterprise">
            <EnterpriseProfile />
          </Tabs.Content>

          <Tabs.Content value="resume">
            <ResumeList />
          </Tabs.Content>

          <Tabs.Content value="submitted">
            <ResumeSubmitted />
          </Tabs.Content>

          <Tabs.Content value="bookmarks-hiring">
            <BookmarksHiring />
          </Tabs.Content>

          {enterpriseProfileData && enterpriseProfileData.length > 0 && (
            <Tabs.Content value="employment">
              <HiringPosts />
            </Tabs.Content>
          )}
        </div>
      </Tabs.Root>
    </div>
  );
}
