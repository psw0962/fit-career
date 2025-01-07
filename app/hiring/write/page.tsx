'use client';

import { usePostHiring } from '@/actions/hiring';
import * as Slider from '@radix-ui/react-slider';
import Image from 'next/image';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import DaumPostcode, { Address } from 'react-daum-postcode';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import Spinner from '@/components/common/spinner';
import GlobalSpinner from '@/components/common/global-spinner';
import { useGetEnterpriseProfile, useGetUserData } from '@/actions/auth';
import { POSITIONS } from '@/constant/position';
import { formatPeriod } from '@/functions/formatPeriod';
import { calculateYearsInBusiness } from '@/functions/calculateYearsInBusiness';
import { useSessionStorage } from 'usehooks-ts';
import { useToast } from '@/hooks/use-toast';

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

  const addressRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const deadLineRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useSessionStorage('activeTab', '');

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

  const { toast } = useToast();

  const { mutate: postHring, status: postHringStatus } = usePostHiring();
  const { data: userData, isLoading: userDataLoading } = useGetUserData();
  const { data: enterpriseProfile, isLoading: enterpriseProfileLoading } =
    useGetEnterpriseProfile(userData?.id ?? '');

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
      // 파일 이름 중복 방지
      const uniqueFiles = Array.from(files).map((file) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const uniqueName = `${uniqueSuffix}-${file.name}`;
        return new File([file], uniqueName, { type: file.type });
      });

      // 상태 업데이트
      setImages((prev) => {
        const totalImages = prev.length + uniqueFiles.length;
        if (totalImages > 5) {
          return prev;
        }
        return [...prev, ...uniqueFiles];
      });

      // 이미지 최대 5개 제한
      if (uniqueFiles.length + images.length > 5) {
        toast({
          title: '회사 이미지는 최대 5개까지 업로드할 수 있습니다.',
          variant: 'warning',
        });
      }
    }

    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const onSubmit = () => {
    if (!address.zoneAddress || !address.detailAddress) {
      toast({
        title: '주소를 모두 입력해주세요.',
        variant: 'warning',
      });
      addressRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (!position.job) {
      toast({
        title: '직무를 선택해주세요.',
        variant: 'warning',
      });
      positionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (position.job === '기타' && !position.etc) {
      toast({
        title: '기타 직무를 입력해주세요.',
        variant: 'warning',
      });
      positionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (!periodValue) {
      toast({
        title: '경력을 선택해주세요.',
        variant: 'warning',
      });
      periodRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: '채용공고 제목을 입력해주세요.',
        variant: 'warning',
      });
      titleRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (!content || !stripHtml(content).trim()) {
      toast({
        title: '채용공고 내용을 입력해주세요.',
        variant: 'warning',
      });
      contentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (!deadLine) {
      toast({
        title: '마감일을 선택해주세요.',
        variant: 'warning',
      });
      deadLineRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    postHring({
      address,
      position,
      periodValue,
      title,
      content,
      deadLine,
      images,
    });
  };

  useEffect(() => {
    if (!userDataLoading && !userData) {
      router.replace('/auth?message=login_required');
      return;
    }

    if (
      !enterpriseProfileLoading &&
      userData &&
      enterpriseProfile !== undefined &&
      (!enterpriseProfile || enterpriseProfile.length === 0)
    ) {
      router.replace('/auth/my-page?message=enterprise_profile_required');
      setActiveTab('enterprise');
      return;
    }
  }, [
    userData,
    enterpriseProfile,
    userDataLoading,
    enterpriseProfileLoading,
    router,
    setActiveTab,
  ]);

  if (
    postHringStatus === 'pending' ||
    enterpriseProfileLoading ||
    userDataLoading
  ) {
    return <GlobalSpinner />;
  }

  return (
    <div className="flex flex-col">
      <p className="text-3xl font-bold mb-4 underline underline-offset-4 decoration-[#4C71C0]">
        채용공고 등록
      </p>

      <div className="text-xs p-2 bg-[#EAEAEC] rounded break-keep">
        <p className="font-bold text-sm">
          • 무분별한 도배 게시글 방지를 위해 채용공고 등록은 24시간마다 한 번만
          할 수 있어요.
        </p>
        <p className="text-sm">
          • 지원자가 한눈에 직무와 관련된 정보를 파악할 수 있도록 명확하고
          간결한 제목을 작성하면 좋아요.
        </p>
        <p className="text-sm">
          • 회사의 비전, 미션, 문화 등을 간단히 소개하여 지원자가 회사에 대한
          이해를 높일 수 있도록 하면 좋아요.
        </p>
        <p className="text-sm">
          • 필수 자격 요건과 우대 사항을 명확히 구분하여 작성하고, 근무 지역과
          회사가 제공하는 혜택과 복지를 명시하여 지원률을 높일 수 있어요.
        </p>
        <p className="text-sm">
          • 지원 절차와 채용 프로세스를 명확히 안내하여 지원자가 쉽게 지원할 수
          있도록 하면 좋아요.
        </p>
      </div>

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
                  {calculateYearsInBusiness(
                    enterpriseProfile[0]?.establishment
                  )}
                  년차 (
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
      <div className="flex flex-col mb-20" ref={addressRef}>
        <label htmlFor="address" className="text-2xl font-bold mb-2">
          근무 지역 <span className="text-sm text-red-500 align-top">*</span>
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
      <div className="flex flex-col mb-20" ref={positionRef}>
        <label htmlFor="job-position" className="text-2xl font-bold mb-2">
          채용 직무<span className="text-sm text-red-500 align-top">*</span>
        </label>

        <select
          name="job-position"
          id="job-position"
          className={`appearance-none border p-2 mb-4 rounded ${
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
      <div className="flex flex-col mb-20" ref={periodRef}>
        <label htmlFor="employment-period" className="text-2xl font-bold mb-2">
          필요 경력 <span className="text-sm text-red-500 align-top">*</span>
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
      <div className="flex flex-col mb-20" ref={titleRef}>
        <label htmlFor="title" className="text-2xl font-bold mb-2">
          채용공고 제목{' '}
          <span className="text-sm text-red-500 align-top">*</span>
        </label>
        <input
          id="title"
          className="border p-2 mb-4 rounded"
          type="text"
          placeholder="채용 글 제목을 입력해 주세요"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </div>

      {/* content */}
      <div className="flex flex-col mb-20" ref={contentRef}>
        <label htmlFor="content" className="text-2xl font-bold mb-2">
          채용공고 내용{' '}
          <span className="text-sm text-red-500 align-top">*</span>
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
      <div className="flex flex-col mb-20" ref={deadLineRef}>
        <label htmlFor="deadline" className="text-2xl font-bold mb-2">
          마감일 <span className="text-sm text-red-500 align-top">*</span>
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
      <div className="flex flex-col">
        <p className="text-2xl font-bold mb-2">
          회사 이미지
          <span className="text-xs text-red-500 align-bottom ml-2">
            * 이미지 파일 확장자는 jpg, jpeg, png, webp만 지원해요.
          </span>
        </p>

        <label className="relative py-2 px-4 bg-[#4C71C0] text-white font-bold w-fit rounded mt-2 cursor-pointer">
          <div className="flex gap-2 items-center justify-center">
            <Image
              src="/svg/upload.svg"
              alt="upload"
              width={32}
              height={32}
              priority
              className="invert brightness-0"
            />
            <p className="text-sm text-white">이미지 업로드</p>
          </div>

          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            multiple
            accept="image/jpeg, image/jpg, image/png, image/webp"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {images.length > 0 && <div className="border border-gray-300 my-4"></div>}

      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div key={index} className="relative w-32 h-32 border rounded">
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
        className="mx-auto mt-20 px-4 py-2 bg-[#4C71C0] text-white rounded w-fit"
        onClick={() => onSubmit()}
      >
        등록하기
      </button>
    </div>
  );
};

export default HiringWrite;
