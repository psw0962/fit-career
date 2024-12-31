'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useEffect, useRef, useState } from 'react';
import withAuth from '@/hoc/withAuth';
import Profile from '@/components/my-page/profile';
import EnterpriseProfile from '@/components/my-page/enterprise-profile';
import ResumeList from '@/components/my-page/resume/resume-list';
import HiringPosts from '@/components/my-page/hiring-posts';
import ResumeSubmitted from '@/components/my-page/resume/resume-submitted';
import { useGetEnterpriseProfile } from '@/actions/auth';
const MyPage = () => {
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [activeTab, setActiveTab] = useState<string>('profile');

  const { data: enterpriseProfileData } = useGetEnterpriseProfile();

  const getClassName = (value: string) => {
    return `px-4 py-2 ${
      activeTab === value
        ? 'border-b-2 border-[#4C71C0]'
        : 'border-b-2 border-transparent text-[#C3C4C5]'
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

  return (
    <div>
      <p className="text-3xl font-bold mb-4 underline underline-offset-4 decoration-[#4C71C0]">
        마이페이지
      </p>

      <Tabs.Root
        className="pt-4"
        defaultValue="profile"
        onValueChange={(value) => setActiveTab(value)}
      >
        <Tabs.List className="flex border-b whitespace-nowrap overflow-auto">
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
            내가 지원한 채용공고
          </Tabs.Trigger>

          {enterpriseProfileData && enterpriseProfileData.length > 0 && (
            <Tabs.Trigger
              ref={(el) => {
                tabRefs.current['employment'] = el;
              }}
              className={getClassName('employment')}
              value="employment"
            >
              내가 등록한 채용공고
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <div className="mt-4">
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

          {enterpriseProfileData && enterpriseProfileData.length > 0 && (
            <Tabs.Content value="employment">
              <HiringPosts />
            </Tabs.Content>
          )}
        </div>
      </Tabs.Root>
    </div>
  );
};

export default withAuth(MyPage);
