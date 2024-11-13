'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';

const MyPage = () => {
  const [activeTab, setActiveTab] = useState<string>('profile');

  const getClassName = (value: string) => {
    return `px-4 py-2 ${
      activeTab === value
        ? 'border-b-2 border-[#4C71C0]'
        : 'border-b-2 border-transparent text-[#C3C4C5]'
    }`;
  };

  return (
    <div className="p-4">
      <Tabs.Root
        defaultValue="profile"
        onValueChange={(value) => setActiveTab(value)}
      >
        <Tabs.List className="flex border-b">
          <Tabs.Trigger className={getClassName('profile')} value="profile">
            프로필
          </Tabs.Trigger>

          <Tabs.Trigger className={getClassName('documents')} value="documents">
            내 이력서
          </Tabs.Trigger>

          <Tabs.Trigger className={getClassName('settings')} value="settings">
            기업회원
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-4">
          <Tabs.Content value="profile">
            <p>프로필</p>
          </Tabs.Content>

          <Tabs.Content value="documents">
            <p>내 이력서</p>
          </Tabs.Content>

          <Tabs.Content value="settings">
            <p>기업회원</p>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};

export default MyPage;
