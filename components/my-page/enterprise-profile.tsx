'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import DaumPostcode, { Address } from 'react-daum-postcode';
import Spinner from '@/components/common/spinner';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import {
  useGetEnterpriseProfile,
  usePatchEnterpriseProfile,
  usePostEnterpriseProfile,
} from '@/actions/auth';

const FroalaEditor = dynamic(
  async () => {
    const values = await Promise.all([
      import('react-froala-wysiwyg'),
      import('froala-editor/js/plugins.pkgd.min.js'),
    ]);
    return values[0];
  },
  {
    loading: () => <Spinner />,
    ssr: false,
  }
);

const FroalaEditorView = dynamic(
  import('react-froala-wysiwyg/FroalaEditorView'),
  {
    loading: () => <></>,
    ssr: false,
  }
);

// daum post code
const THEMEOBJ = {
  bgColor: '', // 바탕 배경색
  searchBgColor: '', // 검색창 배경색
  contentBgColor: '', // 본문 배경색(검색결과,결과없음,첫화면,검색서제스트)
  pageBgColor: '', // 페이지 배경색
  textColor: '', // 기본 글자색
  queryTextColor: '', // 검색창 글자색
  postcodeTextColor: '', // 우편번호 글자색
  emphTextColor: '', // 강조 글자색
  outlineColor: '', // 테두리
};

const DAUMPOSTCODESTYLE = {
  width: '400px',
  height: '600px',
  border: '1.4px solid #333333',
};

const EnterpriseProfile = (): React.ReactElement => {
  const [name, setName] = useState<string>('');
  const [establishment, setEstablishment] = useState<string>('1');
  const [address, setAddress] = useState({
    findAddressModal: false,
    zoneCode: '',
    zoneAddress: '',
    detailAddress: '',
  });
  const [description, setDescription] = useState<string>('');
  const [settingLogo, setSettingLogo] = useState<File[]>([]);
  const [currentLogo, setCurrentLogo] = useState<string>('');

  const daumPostCodeHandler = (data: Address) => {
    setAddress({
      ...address,
      zoneAddress: data.address,
      zoneCode: data.zonecode,
      findAddressModal: false,
    });
  };

  const { mutate: postMutate, isIdle: postIdle } = usePostEnterpriseProfile();
  const { mutate: patchMutate, isIdle: patchIdle } =
    usePatchEnterpriseProfile();
  const { data: enterpriseProfile } = useGetEnterpriseProfile();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSettingLogo([...settingLogo, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setSettingLogo(settingLogo.filter((_, i) => i !== index));
  };

  const onSubmit = () => {
    if (!name.trim()) {
      alert('회사 이름을 입력해주세요.');
      return;
    }

    if (!address.zoneAddress || !address.detailAddress) {
      alert('주소를 모두 입력해주세요.');
      return;
    }

    if (establishment === '0') {
      alert('업력을 입력해주세요.');
      return;
    }

    if (!description.trim()) {
      alert('회사 소개를 입력해주세요.');
      return;
    }

    if (enterpriseProfile?.length === 0) {
      return postMutate({
        name,
        establishment,
        address,
        description,
        settingLogo,
      });
    } else {
      return patchMutate({
        name,
        establishment,
        address,
        description,
        settingLogo,
        currentLogo,
      });
    }
  };

  useEffect(() => {
    if (
      enterpriseProfile?.length !== 0 &&
      enterpriseProfile !== undefined &&
      enterpriseProfile !== null
    ) {
      const [zoneCode, ...zoneAddress] =
        enterpriseProfile[0].address.split(' ');

      setCurrentLogo(enterpriseProfile[0].logo[0]);
      setName(enterpriseProfile[0].name);
      setAddress({
        ...address,
        zoneCode: zoneCode,
        zoneAddress: zoneAddress.slice(0, -1).join(' '),
        detailAddress: zoneAddress.pop(),
      });
      setEstablishment(enterpriseProfile[0].establishment);
      setDescription(enterpriseProfile[0].description);
    }
  }, [enterpriseProfile]);

  if (!postIdle || !patchIdle) {
    return <Spinner />;
  }

  return (
    <div>
      {/* logo */}
      <div className="flex flex-col mb-20 mt-10">
        <label className="text-2xl font-bold mb-2 text-gray-800">
          회사 로고
        </label>

        <div>
          {/*  이미지가 업로드 되기 전 */}
          {!currentLogo && settingLogo.length === 0 && (
            <div className="relative flex items-center justify-center w-36 h-36 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition-all">
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V12M7 8h.01M16 12V8m0 8h.01M16 12h.01m0 0L12 16l-4-4"
                  />
                </svg>
                <span className="text-gray-600">이미지 업로드</span>
              </div>
            </div>
          )}

          {/* 현재 상태 로고가 업로드 된 경우 */}
          {settingLogo.length > 0 && (
            <div className="relative w-28 h-20 border-gray-300">
              <div className="relative w-20 h-20">
                <Image
                  src={URL.createObjectURL(settingLogo[0])}
                  alt="enterprise logo"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                />
              </div>

              <button
                onClick={() => removeImage(0)}
                className="absolute top-2 right-2 bg-[#4C71C0] text-white rounded px-1"
              >
                &times;
              </button>
            </div>
          )}

          {/* 이미 업로드된 로고를 가져오는 경우 */}
          {enterpriseProfile &&
            enterpriseProfile[0]?.logo[0]?.length > 0 &&
            currentLogo !== '' && (
              <div className="relative w-28 h-20 border-gray-300">
                <div className="relative w-20 h-20">
                  <Image
                    src={currentLogo}
                    alt="enterprise logo"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                  />
                </div>

                <button
                  onClick={() => setCurrentLogo('')}
                  className="absolute top-2 right-2 bg-[#4C71C0] text-white rounded px-1"
                >
                  &times;
                </button>
              </div>
            )}
        </div>
      </div>

      {/* name */}
      <div className="flex flex-col mb-20">
        <label className="text-2xl font-bold mb-2">회사 이름</label>
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="회사 이름을 입력해 주세요"
          defaultValue={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>

      {/* address */}
      <div className="flex flex-col mb-20">
        <label className="text-2xl font-bold mb-2">주소</label>

        <button
          className="py-2 px-4 bg-[#4C71C0] text-white font-bold w-fit rounded mb-2"
          onClick={() => setAddress({ ...address, findAddressModal: true })}
        >
          주소 찾기
        </button>

        {address.zoneCode && address.zoneAddress && (
          <>
            <input
              type="text"
              value={
                address.zoneCode && address.zoneAddress
                  ? `[${address.zoneCode}] ${address.zoneAddress}`
                  : ''
              }
              readOnly
              disabled
              className="border p-2 mb-2"
            />

            <input
              type="text"
              onChange={(e) =>
                setAddress({ ...address, detailAddress: e.target.value })
              }
              value={address.detailAddress}
              placeholder="상세 주소 입력"
              className="border p-2"
            />
          </>
        )}

        {address.findAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex flex-col bg-white p-4 rounded shadow-lg">
              <DaumPostcode
                theme={THEMEOBJ}
                style={DAUMPOSTCODESTYLE}
                onComplete={daumPostCodeHandler}
              />

              <button
                className="mt-4 py-1 px-4 bg-[#4C71C0] text-white rounded"
                onClick={() =>
                  setAddress({ ...address, findAddressModal: false })
                }
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* establishment */}
      <div className="flex flex-col mb-20">
        <label className="text-2xl font-bold mb-2">업력</label>

        <div className="flex gap-2 items-center">
          <input
            className="border p-2 mb-4 rounded w-24"
            type="number"
            placeholder="업력을 입력해 주세요"
            value={establishment}
            onChange={(e) => {
              setEstablishment(e.target.value);
            }}
          />

          <p className="text-xl">년차</p>
        </div>
      </div>

      {/* description */}
      <div className="flex flex-col mb-4">
        <label className="text-2xl font-bold mb-2">회사 소개</label>

        <FroalaEditor
          tag="textarea"
          model={description}
          onModelChange={(event) => setDescription(event)}
          config={{
            // charCounterCount: true,
            // charCounterMax: 1000,
            placeholderText: '회사 소개를 입력해 주세요',
            fontSize: ['1', '1.2', '1.4', '1.6', '1.8', '2'],
            fontSizeDefaultSelection: '20px',
            fontSizeUnit: 'rem',
          }}
        />

        <FroalaEditorView model={description} />
      </div>

      <div className="flex justify-center mt-10">
        <button
          className="px-4 py-2 bg-[#4C71C0] text-white rounded w-fit"
          onClick={() => onSubmit()}
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default EnterpriseProfile;
