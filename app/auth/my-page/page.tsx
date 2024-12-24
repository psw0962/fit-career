'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useEffect, useRef, useState } from 'react';
import withAuth from '@/hoc/withAuth';
import Profile from '@/components/my-page/profile';
import EnterpriseProfile from '@/components/my-page/enterprise-profile';
import Resume from '@/components/my-page/resume/resume';
import HiringPost from '@/components/my-page/hiring-post';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState<string>('resume');
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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
        defaultValue="resume"
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
              tabRefs.current['employment'] = el;
            }}
            className={getClassName('employment')}
            value="employment"
          >
            내가 등록한 채용공고
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-4">
          <Tabs.Content value="profile">
            <Profile />
          </Tabs.Content>

          <Tabs.Content value="enterprise">
            <EnterpriseProfile />
          </Tabs.Content>

          <Tabs.Content value="resume">
            <Resume />
          </Tabs.Content>

          <Tabs.Content value="employment">
            <HiringPost />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};

export default withAuth(MyPage);
