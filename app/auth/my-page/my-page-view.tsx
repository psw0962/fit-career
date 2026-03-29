'use client';

import dynamic from 'next/dynamic';
import * as Tabs from '@radix-ui/react-tabs';
import { useEffect, useRef } from 'react';
import { useSessionStorage } from 'usehooks-ts';
import { useGetEnterpriseProfile, useGetUserData } from '@/api/auth';
import GlobalSpinner from '@/components/common/global-spinner';

const Profile = dynamic(() => import('@/components/my-page/profile'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});
const EnterpriseProfile = dynamic(() => import('@/components/my-page/enterprise-profile'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});
const ResumeList = dynamic(() => import('@/components/my-page/resume/resume-list'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});
const ResumeSubmitted = dynamic(() => import('@/components/my-page/resume/resume-submitted'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});
const HiringPosts = dynamic(() => import('@/components/my-page/hiring/hiring-posts'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});
const BookmarksHiring = dynamic(() => import('@/components/my-page/bookmarks-hiring'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});

const PERSONAL_TABS = ['profile', 'resume', 'submitted', 'bookmarks-hiring'];
const ENTERPRISE_TABS = ['enterprise', 'employment'];

export default function MyPageView() {
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [activeTab, setActiveTab] = useSessionStorage('activeTab', 'profile');
  const [activeMode, setActiveMode] = useSessionStorage<'personal' | 'enterprise'>(
    'activeMode',
    'personal',
  );

  const { data: userData, isLoading: isUserDataLoading } = useGetUserData();
  const { data: enterpriseProfileData, isLoading: isEnterpriseProfileLoading } =
    useGetEnterpriseProfile(userData?.id ?? '');

  const hasEnterpriseProfile = enterpriseProfileData && enterpriseProfileData.length > 0;

  const handleModeChange = (mode: 'personal' | 'enterprise') => {
    setActiveMode(mode);
    if (mode === 'personal') {
      setActiveTab('profile');
    } else {
      setActiveTab('enterprise');
    }
  };

  // 현재 탭이 선택된 모드와 맞지 않으면 모드를 보정
  useEffect(() => {
    if (ENTERPRISE_TABS.includes(activeTab)) {
      setActiveMode('enterprise');
    } else if (PERSONAL_TABS.includes(activeTab)) {
      setActiveMode('personal');
    }
  }, []);

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

  const getTabClassName = (value: string) => {
    return `px-3 py-1.5 text-sm transition-colors ${
      activeTab === value
        ? 'border-2 rounded border-[#4C71C0] text-[#4C71C0] font-medium z-10'
        : 'border-2 rounded border-transparent text-[#C3C4C5] z-0'
    }`;
  };

  return (
    <div>
      <div className='flex justify-between items-center'>
        <p className='text-2xl font-bold underline underline-offset-4 decoration-[#4C71C0]'>
          마이페이지
        </p>
      </div>

      {/* 모드 스위처 */}
      <div className='flex gap-2 mt-5'>
        <button
          onClick={() => handleModeChange('personal')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeMode === 'personal'
              ? 'bg-[#4C71C0] text-white'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <span>👤</span>
          개인
        </button>
        <button
          onClick={() => handleModeChange('enterprise')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeMode === 'enterprise'
              ? 'bg-[#4C71C0] text-white'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <span>🏢</span>
          기업
        </button>
      </div>

      {/* 서브 탭 */}
      <Tabs.Root className='pt-3' value={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <Tabs.List className='relative flex whitespace-nowrap overflow-auto pb-2'>
          {activeMode === 'personal' && (
            <>
              <Tabs.Trigger
                ref={(el) => {
                  tabRefs.current['profile'] = el;
                }}
                className={getTabClassName('profile')}
                value='profile'
              >
                프로필
              </Tabs.Trigger>
              <Tabs.Trigger
                ref={(el) => {
                  tabRefs.current['resume'] = el;
                }}
                className={getTabClassName('resume')}
                value='resume'
              >
                내 이력서
              </Tabs.Trigger>
              <Tabs.Trigger
                ref={(el) => {
                  tabRefs.current['submitted'] = el;
                }}
                className={getTabClassName('submitted')}
                value='submitted'
              >
                지원한 채용공고
              </Tabs.Trigger>
              <Tabs.Trigger
                ref={(el) => {
                  tabRefs.current['bookmarks-hiring'] = el;
                }}
                className={getTabClassName('bookmarks-hiring')}
                value='bookmarks-hiring'
              >
                북마크한 채용공고
              </Tabs.Trigger>
            </>
          )}

          {activeMode === 'enterprise' && (
            <>
              <Tabs.Trigger
                ref={(el) => {
                  tabRefs.current['enterprise'] = el;
                }}
                className={getTabClassName('enterprise')}
                value='enterprise'
              >
                기업 프로필
              </Tabs.Trigger>
              {hasEnterpriseProfile && (
                <Tabs.Trigger
                  ref={(el) => {
                    tabRefs.current['employment'] = el;
                  }}
                  className={getTabClassName('employment')}
                  value='employment'
                >
                  등록한 채용공고
                </Tabs.Trigger>
              )}
            </>
          )}
        </Tabs.List>

        <div className='w-full h-[1px] mt-2 bg-gray-200' />

        <div>
          <Tabs.Content value='profile'>
            <Profile />
          </Tabs.Content>
          <Tabs.Content value='resume'>
            <ResumeList />
          </Tabs.Content>
          <Tabs.Content value='submitted'>
            <ResumeSubmitted />
          </Tabs.Content>
          <Tabs.Content value='bookmarks-hiring'>
            <BookmarksHiring />
          </Tabs.Content>
          <Tabs.Content value='enterprise'>
            <EnterpriseProfile />
          </Tabs.Content>
          {hasEnterpriseProfile && (
            <Tabs.Content value='employment'>
              <HiringPosts />
            </Tabs.Content>
          )}
        </div>
      </Tabs.Root>
    </div>
  );
}
