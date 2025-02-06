'use client';

import { useGetHiringById, usePatchHiring } from '@/actions/hiring';
import * as Slider from '@radix-ui/react-slider';
import Image from 'next/image';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Address, useDaumPostcodePopup } from 'react-daum-postcode';
import 'react-datepicker/dist/react-datepicker.css';
import GlobalSpinner from '@/components/common/global-spinner';
import { useGetEnterpriseProfile, useGetUserData } from '@/actions/auth';
import { POSITIONS } from '@/constant/position';
import { formatPeriod } from '@/functions/formatPeriod';
import { calculateYearsInBusiness } from '@/functions/calculateYearsInBusiness';
import { useSessionStorage } from 'usehooks-ts';
import { useToast } from '@/hooks/use-toast';
import SortableImageDnd from '@/components/common/sortable-image-dnd';
import { withAuth } from '@/hoc/withAuth';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import imageCompression from 'browser-image-compression';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

interface UploadedImage {
  id: string;
  file: File | string;
}

function HiringEditView({ hiringId }: { hiringId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const open = useDaumPostcodePopup();
  const { toast } = useToast();

  const addressRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const deadLineRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useSessionStorage('activeTab', '');

  const [address, setAddress] = useState({
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
  const [content, setContent] = useState('');
  const [deadLine, setDeadLine] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [images, setImages] = useState<UploadedImage[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[200px] border p-2 rounded focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  const { mutate: patchHiring, status: patchHiringStatus } = usePatchHiring();
  const { data: hiringData, isLoading: hiringDataLoading } =
    useGetHiringById(hiringId);
  const { data: userData, isLoading: userDataLoading } = useGetUserData();
  const { data: enterpriseProfile, isLoading: enterpriseProfileLoading } =
    useGetEnterpriseProfile(userData?.id ?? '');

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 2,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const daumPostCodeHandler = (data: Address) => {
    setAddress({
      ...address,
      zoneAddress: data.address,
      zoneCode: data.zonecode,
    });
  };

  const periodValueHandleChange = (value: number[]) => {
    setPeriodValue(value);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const compressedImages: UploadedImage[] = [];

      for (const file of fileArray) {
        try {
          const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          };

          const compressedBlob = await imageCompression(file, options);
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}`;
          const uniqueId = `${uniqueSuffix}-${file.name}`;
          const compressedFile = new File([compressedBlob], file.name, {
            type: file.type,
          });
          compressedImages.push({ id: uniqueId, file: compressedFile });
        } catch (error) {
          console.error('Image compression error:', error);
        }
      }

      setImages((prev) => {
        const totalImages = prev.length + compressedImages.length;
        if (totalImages > 5) {
          toast({
            title: '회사 이미지는 최대 5개까지 업로드할 수 있습니다.',
            variant: 'warning',
          });
          return prev;
        }
        return [...prev, ...compressedImages];
      });
    }

    event.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prevImages) => {
      const oldIndex = prevImages.findIndex((img) => img.id === active.id);
      const newIndex = prevImages.findIndex((img) => img.id === over.id);
      return arrayMove(prevImages, oldIndex, newIndex);
    });
  }, []);

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

    patchHiring({
      id: hiringId,
      address,
      position,
      periodValue,
      title,
      content,
      deadLine,
      images: images.map((img) => img.file),
    });
  };

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!userDataLoading && !userData) {
      router.push(
        `/auth?message=login_required&redirect=${encodeURIComponent(
          pathname || '/'
        )}`
      );
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
    hiringId,
    setActiveTab,
  ]);

  useEffect(() => {
    if (hiringData) {
      const fullAddress = hiringData.address.split(' ');
      const zoneCode = fullAddress[0];
      const zoneAddress = fullAddress.slice(1, -1).join(' ');
      const detailAddress = fullAddress[fullAddress.length - 1];

      setAddress({
        zoneCode,
        zoneAddress,
        detailAddress,
      });

      setPosition({
        job: hiringData.position_etc ? '기타' : hiringData.position,
        etc: hiringData.position_etc ? hiringData.position : '',
      });

      setPeriodValue(hiringData.period);
      setTitle(hiringData.title);
      setContent(hiringData.content);
      setDeadLine(hiringData.dead_line);
      setImages(
        hiringData.images.map((img: string) => ({
          id: img,
          file: img,
        }))
      );
    }
  }, [hiringData]);

  if (
    patchHiringStatus === 'pending' ||
    enterpriseProfileLoading ||
    userDataLoading ||
    hiringDataLoading
  ) {
    return <GlobalSpinner />;
  }

  return (
    <div className="flex flex-col">
      <p className="text-2xl font-bold mb-4 underline underline-offset-4 decoration-[#4C71C0]">
        채용공고 수정
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
                <div className="flex gap-1 items-center">
                  <div className="relative w-6 h-6">
                    <Image
                      src={
                        enterpriseProfile[0]?.logo?.length !== 0
                          ? enterpriseProfile[0]?.logo[0]
                          : '/svg/logo.svg'
                      }
                      alt="enterprise logo"
                      style={{ objectFit: 'contain' }}
                      className="rounded"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
                      quality={75}
                    />
                  </div>

                  <p>{enterpriseProfile[0]?.name}</p>
                </div>
              </div>

              <p className="mt-2 text-sm">
                {enterpriseProfile[0]?.industry} /{' '}
                {calculateYearsInBusiness(enterpriseProfile[0]?.establishment)}
                년차 (
                {parseInt(
                  enterpriseProfile[0]?.establishment.split('-')[0],
                  10
                )}
                )
              </p>

              <div className="mt-2 text-[#707173] text-sm">
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
        <p className="text-2xl font-bold mb-2">
          근무 지역 <span className="text-sm text-red-500 align-top">*</span>
        </p>

        <button
          className="py-2 px-4 bg-[#4C71C0] text-white font-bold w-fit rounded mb-2"
          onClick={() => open({ onComplete: daumPostCodeHandler })}
        >
          주소 찾기
        </button>

        {address.zoneCode && address.zoneAddress && (
          <>
            <input
              type="text"
              id="address-zone"
              name="address-zone"
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
              id="address-detail"
              name="address-detail"
              onChange={(e) =>
                setAddress({ ...address, detailAddress: e.target.value })
              }
              value={address.detailAddress}
              placeholder="상세 주소 입력"
              className="border p-2"
            />
          </>
        )}
      </div>

      {/* job position */}
      <div className="flex flex-col mb-20" ref={positionRef}>
        <p className="text-2xl font-bold mb-2">
          채용 직무<span className="text-sm text-red-500 align-top">*</span>
        </p>

        <select
          id="job-position"
          name="job-position"
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
            id="job-position-etc"
            name="job-position-etc"
            type="text"
            className="appearance-none border py-3 px-2 mb-4 rounded"
            placeholder="직무를 입력해 주세요"
            value={position.etc}
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
        <p className="text-2xl font-bold mb-2">
          필요 경력 <span className="text-sm text-red-500 align-top">*</span>
        </p>

        {formatPeriod(periodValue)}

        <Slider.Root
          id="employment-period"
          name="employment-period"
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
        <p className="text-2xl font-bold mb-2">
          채용공고 제목
          <span className="text-sm text-red-500 align-top">*</span>
        </p>
        <input
          id="title"
          name="title"
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
        <p className="text-2xl font-bold mb-2">
          채용공고 내용
          <span className="text-sm text-red-500 align-top">*</span>
        </p>

        <EditorContent editor={editor} />
      </div>

      {/* deadline */}
      <div className="flex flex-col mb-20" ref={deadLineRef}>
        <p className="text-2xl font-bold mb-2">
          마감일 <span className="text-sm text-red-500 align-top">*</span>
        </p>

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
        <p className="text-2xl font-bold mb-2">회사 이미지</p>

        <div className="text-xs p-2 bg-[#EAEAEC] rounded break-keep">
          <p className="font-bold text-sm">
            • 이미지는 최대 5개까지 업로드 가능해요
          </p>
          <p className="text-sm">
            • <span className="font-bold">가로 방향</span>의 사진이 회사의
            전체적인 모습을 더 잘 보여줄 수 있습니다.
          </p>
          <p className="text-sm">
            • 이미지 파일 확장자는 jpg, jpeg, png, webp만 지원해요.
          </p>
          <p className="text-sm">
            • 첫 번째 이미지가 채용공고 대표 이미지로 사용돼요.
          </p>
          <p className="text-sm">
            • 이미지를 드래그하면 업로드될 이미지 순서를 변경할 수 있어요.
          </p>
        </div>

        <div className="relative py-1 px-4 bg-[#4C71C0] text-white font-bold w-fit rounded mt-2 cursor-pointer">
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
        </div>
      </div>

      {images.length > 0 && <div className="border border-gray-300 my-4"></div>}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div key={img.id} className="flex flex-col items-center gap-2">
                <SortableImageDnd
                  id={img.id}
                  index={index}
                  image={img.file}
                  onRemove={() => removeImage(img.id)}
                />
                {index === 0 && (
                  <p className="text-xs sm:text-sm font-bold">대표 이미지</p>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        className="mx-auto mt-20 px-8 py-3 bg-[#4C71C0] text-white rounded w-fit"
        onClick={() => onSubmit()}
      >
        수정하기
      </button>
    </div>
  );
}

export default withAuth(HiringEditView);
