'use client';

import { usePostHiring } from '@/actions/hiring';
import * as Slider from '@radix-ui/react-slider';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DaumPostcode, { Address } from 'react-daum-postcode';
import withAuth from '@/hoc/withAuth';

const FroalaEditor = dynamic(
  async () => {
    const values = await Promise.all([
      import('react-froala-wysiwyg'),
      import('froala-editor/js/plugins.pkgd.min.js'),
    ]);
    return values[0];
  },
  {
    loading: () => <p>LOADING</p>,
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
  const [period, setPeriod] = useState('');
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

  const daumPostCodeHandler = (data: Address) => {
    setAddress({
      ...address,
      zoneAddress: data.address,
      zoneCode: data.zonecode,
      findAddressModal: false,
    });
  };

  const periodValueHandleChange = (newValue: number[]) => {
    const [start, end] = newValue;

    let result = '';

    if (start === 0 && end === 10) {
      result = '전체';
      setPeriodValue(newValue);
      setPeriod(result);

      return;
    }

    if (start === 0 && end === 0) {
      result = `신입/연습생`;
      setPeriodValue(newValue);
      setPeriod(result);

      return;
    }

    if (start === end) {
      result = `${start}년 이상`;
      setPeriodValue(newValue);
      setPeriod(result);

      return;
    }

    if (start === 0 || end === 0) {
      result = `신입 ~ ${end}년 이상`;
      setPeriodValue(newValue);
      setPeriod(result);

      return;
    }

    result = `${start}년 ~ ${end === 10 ? '10년 이상' : `${end}년 이상`}`;
    setPeriodValue(newValue);
    setPeriod(result);

    return;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImages([...images, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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

    if (!period) {
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
      period,
      title,
      content,
      deadLine,
      images,
    });
  };

  useEffect(() => {
    if (period === '') {
      setPeriod('신입 ~ 10년 이상');
      return;
    }
  }, []);

  return (
    <div className="flex flex-col">
      <p className="text-3xl font-bold mb-4 underline underline-offset-4 decoration-[#4C71C0]">
        채용공고 등록
      </p>

      {/* address */}
      <div className="flex flex-col mb-4 mt-10">
        <label className="text-2xl font-bold mb-2">지역</label>

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

      {/* job position */}
      <div className="flex flex-col mb-4 mt-10">
        <label htmlFor="job-position" className="text-2xl font-bold mb-2">
          직무
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
          <option value="퍼스널 트레이너(PT)">퍼스널 트레이너(PT)</option>
          <option value="필라테스">필라테스</option>
          <option value="요가">요가</option>
          <option value="골프">골프</option>
          <option value="GX(댄스/스피닝/에어로빅/그룹운동)">
            GX(댄스/스피닝/에어로빅/그룹운동)
          </option>
          <option value="체조/발레/무용">체조/발레/무용</option>
          <option value="점핑/트램폴린">점핑/트램폴린</option>
          <option value="구기종목(축구/농구/배구/테니스/스쿼시)">
            구기종목(축구/농구/배구/테니스/스쿼시)
          </option>
          <option value="인포메이션(FC)">인포메이션(FC)</option>
          <option value="지점 관리자">지점 관리자</option>
          <option value="학교 체육/방과후 강사">학교 체육/방과후 강사</option>
          <option value="경호/행사/이벤트">경호/행사/이벤트</option>
          <option value="기타">기타</option>
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
      <div className="flex flex-col mb-4 mt-10">
        <label htmlFor="employment-period" className="text-2xl font-bold mb-2">
          필요 경력
        </label>

        {period}

        <Slider.Root
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
      <div className="flex flex-col mb-4 mt-10">
        <label className="text-2xl font-bold mb-2">채용공고 제목</label>
        <input
          className="border p-2 mb-4 rounded"
          type="text"
          placeholder="채용 글 제목을 입력해 주세요"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </div>

      {/* content */}
      <div className="flex flex-col mb-4 mt-10">
        <label className="text-2xl font-bold mb-2">채용공고 내용</label>

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
      <div className="flex flex-col mb-4 mt-10">
        <label className="text-2xl font-bold mb-2">마감일</label>

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
      <div className="flex flex-col mb-4 mt-10">
        <label className="text-2xl font-bold mb-2 text-gray-800">
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
        className="mx-auto mt-20 px-4 py-2 bg-[#4C71C0] text-white rounded w-fit"
        onClick={() => onSubmit()}
      >
        등록하기
      </button>
    </div>
  );
};

export default withAuth(HiringWrite);
