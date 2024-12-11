'use client';

import { usePostHiring } from '@/actions/hiring';
import * as Slider from '@radix-ui/react-slider';
import Image from 'next/image';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import DaumPostcode, { Address } from 'react-daum-postcode';
import withAuth from '@/hoc/withAuth';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import Spinner from '@/components/common/spinner';
import GlobalSpinner from '@/components/common/global-spinner';
import { useGetEnterpriseProfile } from '@/actions/auth';
import { POSITIONS } from '@/constant/position';
import { formatPeriod } from '@/functions/formatPeriod';

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

const HiringWrite = () => {
  const router = useRouter();

  const [address, setAddress] = useState({
    findAddressModal: false,
    zoneCode: '',
    zoneAddress: '',
    detailAddress: '',
  });
  const [position, setPosition] = useState({
    job: '',
    etc: '',
  });
  const [periodValue, setPeriodValue] = useState<number[]>([0, 10]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(`
    <p>근무형태 : 오후 근무(14시 ~ 23시) / 주5일(월~금)</p>
    <p>주요업무 : 회원관리, 센터관리</p>
    <p>자격요건 : 생활스포츠지도사2급</p>
    <p>우대사항 : NASM, NSCA 등 관련 자격</p>
    <p>혜택 및 복지 : 4대 보험, 하계 휴가, 교육 비용 지원 등</p>
    <p>채용 절차 : 서류 전형 &gt; 대면 면접 &gt; 처우 협의 &gt; 최종 합격</p>
  `);
  const [deadLine, setDeadLine] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [images, setImages] = useState<File[]>([]);

  const postHring = usePostHiring();
  const { data: enterpriseProfile, isLoading: enterpriseProfileLoading } =
    useGetEnterpriseProfile();

  const daumPostCodeHandler = (data: Address) => {
    setAddress({
      ...address,
      zoneAddress: data.address,
      zoneCode: data.zonecode,
      findAddressModal: false,
    });
  };

  const periodValueHandleChange = (value: number[]) => {
    setPeriodValue(value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateYearsInBusiness = (data: { establishment: string }) => {
    const establishmentYear = parseInt(data?.establishment.split('-')[0], 10);
    const currentYear = new Date().getFullYear();
    return Math.max(currentYear - establishmentYear, 0);
  };

  const onSubmit = () => {
    if (!address.zoneAddress || !address.detailAddress) {
      alert('주소를 모두 입력해주세요.');
      return;
    }

    if (!position.job) {
      alert('직무를 선택해주세요.');
      return;
    }

    if (position.job === '기타' && !position.etc) {
      alert('기타 직무를 입력해주세요.');
      return;
    }

    if (!periodValue) {
      alert('경력을 선택해주세요.');
      return;
    }

    if (!title.trim()) {
      alert('채용공고 제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('채용공고 내용을 입력해주세요.');
      return;
    }

    if (!deadLine) {
      alert('마감일을 선택해주세요.');
      return;
    }

    postHring.mutate({
      address,
      position,
      periodValue,
      title,
      content,
      deadLine,
      images,
      enterprise_name: enterpriseProfile?.[0]?.name ?? '',
      enterprise_logo: enterpriseProfile?.[0]?.logo?.[0] ?? '',
      enterprise_establishment: enterpriseProfile?.[0]?.establishment ?? '',
      enterprise_description: enterpriseProfile?.[0]?.description ?? '',
    });
  };

  if (enterpriseProfile?.length === 0) {
    alert('기업 프로필을 먼저 등록해주세요.');
    router.push('/auth/my-page');
    return;
  }

  if (postHring.isPending || enterpriseProfileLoading) {
    return <GlobalSpinner />;
  }

  return (
    <div className="flex flex-col">
      <p className="text-3xl font-bold mb-4 underline underline-offset-4 decoration-[#4C71C0]">
        채용공고 등록
      </p>

      {/* enterprise profile */}
      <div className="flex flex-col mt-10">
        <div className="flex flex-col md:flex-row gap-2 text-2xl font-bold mb-2 md:items-end">
          <p className="text-2xl font-bold leading-none">기업 프로필</p>

          <p className="text-xs font-bold leading-none">
            * 기업 프로필은 마이페이지에서 변경 가능합니다.
          </p>
        </div>

        {enterpriseProfile && (
          <div>
            <div className="flex flex-col">
              <div className="mt-2 flex gap-2 items-center">
                <div className="relative w-8 h-8">
                  <Image
                    src={
                      enterpriseProfile[0]?.logo?.length !== 0
                        ? enterpriseProfile[0]?.logo[0]
                        : '/svg/logo.svg'
                    }
                    alt="enterprise logo"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                  />
                </div>

                <p>
                  {enterpriseProfile[0]?.name} /{' '}
                  {enterpriseProfile[0]?.industry} /{' '}
                  {calculateYearsInBusiness(enterpriseProfile[0])}년차 (
                  {parseInt(
                    enterpriseProfile[0]?.establishment.split('-')[0],
                    10
                  )}
                  )
                </p>
              </div>

              <div className="mt-2 text-[#707173]">
                <div
                  dangerouslySetInnerHTML={{
                    __html: enterpriseProfile[0]?.description,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 my-7"></div>

      {/* address */}
      <div className="flex flex-col mb-20">
        <label htmlFor="address" className="text-2xl font-bold mb-2">
          근무 지역
        </label>

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
              id="address"
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
              id="address"
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

      {/* job position */}
      <div className="flex flex-col mb-20">
        <label htmlFor="job-position" className="text-2xl font-bold mb-2">
          채용 직무
        </label>

        <select
          name="job-position"
          id="job-position"
          className={`appearance-none border py-3 px-2 mb-4 rounded ${
            position.job === '' ? 'text-gray-400' : 'text-black'
          }`}
          value={position.job}
          onChange={(e) => {
            setPosition({ ...position, job: e.target.value });
          }}
        >
          <option value="" className="text-gray-400">
            직무를 선택해 주세요
          </option>

          {POSITIONS.map((x) => (
            <option key={x.id} value={x.position}>
              {x.position}
            </option>
          ))}
        </select>

        {position.job === '기타' && (
          <input
            type="text"
            className="appearance-none border py-3 px-2 mb-4 rounded"
            placeholder="직무를 입력해 주세요"
            onChange={(e) => {
              setPosition({
                ...position,
                etc: e.target.value,
              });
            }}
          />
        )}
      </div>

      {/* employment period */}
      <div className="flex flex-col mb-20">
        <label htmlFor="employment-period" className="text-2xl font-bold mb-2">
          필요 경력
        </label>

        {formatPeriod(periodValue)}

        <Slider.Root
          id="employment-period"
          className="relative flex h-5 w-[300px] mt-2 touch-none select-none items-center"
          value={periodValue}
          onValueChange={periodValueHandleChange}
          max={10}
          step={1}
        >
          <Slider.Track className="relative h-[3px] grow rounded-full bg-blackA7">
            <Slider.Range className="absolute h-full rounded-full bg-slate-200" />
          </Slider.Track>

          <Slider.Thumb
            className="block size-5 rounded-[10px] bg-[#4C71C0] hover:bg-violet3 focus:shadow-blackA5 focus:outline-none"
            aria-label="Volume"
          />

          <Slider.Thumb
            className="block size-5 rounded-[10px] bg-[#4C71C0] hover:bg-violet3 focus:shadow-blackA5 focus:outline-none"
            aria-label="Volume"
          />
        </Slider.Root>
      </div>

      {/* title */}
      <div className="flex flex-col mb-20">
        <label htmlFor="title" className="text-2xl font-bold mb-2">
          채용공고 제목
        </label>
        <input
          id="title"
          className="border p-2 mb-4 rounded"
          type="text"
          placeholder="채용 글 제목을 입력해 주세요"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </div>

      {/* content */}
      <div className="flex flex-col mb-20">
        <label htmlFor="content" className="text-2xl font-bold mb-2">
          채용공고 내용
        </label>

        <FroalaEditor
          tag="textarea"
          model={content}
          onModelChange={(event) => setContent(event)}
          config={{
            // placeholderText: '',
            // charCounterCount: true,
            // charCounterMax: 1000,
            fontSize: ['1', '1.2', '1.4', '1.6', '1.8', '2'],
            fontSizeDefaultSelection: '20px',
            fontSizeUnit: 'rem',
          }}
        />

        <FroalaEditorView model={content} />
      </div>

      {/* deadline */}
      <div className="flex flex-col mb-20">
        <label htmlFor="deadline" className="text-2xl font-bold mb-2">
          마감일
        </label>

        <DatePicker
          className="px-2 py-2 border rounded"
          selected={parse(deadLine, 'yyyy-MM-dd', new Date())}
          onChange={(date: Date | null) => {
            if (date) {
              setDeadLine(format(date, 'yyyy-MM-dd'));
            }
          }}
          locale={ko}
          dateFormat="yyyy년 MM월 dd일"
          placeholderText="마감일을 선택하세요"
          minDate={new Date()}
        />
      </div>

      {/* images */}
      <div className="flex flex-col mb-4">
        <label htmlFor="file-upload" className="text-2xl font-bold mb-2">
          센터 이미지
        </label>

        <div className="relative flex items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all">
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            multiple
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
      </div>

      <div className="flex flex-wrap mt-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative w-32 h-32 m-2 p-2 border rounded"
          >
            <img
              src={URL.createObjectURL(image)}
              alt={`uploaded ${index}`}
              className="w-full h-full object-cover rounded"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-[#4C71C0] text-white rounded px-1"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <button
        className="mx-auto mt-8 px-4 py-2 bg-[#4C71C0] text-white rounded w-fit"
        onClick={() => onSubmit()}
      >
        등록하기
      </button>
    </div>
  );
};

export default withAuth(HiringWrite);
