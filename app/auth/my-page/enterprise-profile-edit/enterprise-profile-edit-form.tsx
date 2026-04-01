'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Address, useDaumPostcodePopup } from 'react-daum-postcode';
import GlobalSpinner from '@/components/common/global-spinner';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import { POSITIONS } from '@/constant/position';
import { useToast } from '@/hooks/use-toast';
import {
  useGetEnterpriseProfile,
  useGetUserData,
  usePatchEnterpriseProfile,
  usePostEnterpriseProfile,
} from '@/api/auth';
import dynamic from 'next/dynamic';
import imageCompression from 'browser-image-compression';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';

const SortableImageDnd = dynamic(() => import('@/components/common/sortable-image-dnd'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});

const TextEditor = dynamic(() => import('@/components/common/text-editor'), {
  loading: () => <GlobalSpinner />,
  ssr: false,
});

export default function EnterpriseProfileEditForm(): React.ReactElement {
  const open = useDaumPostcodePopup();
  const { toast } = useToast();

  const nameRef = useRef<HTMLInputElement>(null);
  const industryRef = useRef<HTMLDivElement>(null);
  const industryEtcRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const establishmentRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState<string>('');
  const [industry, setIndustry] = useState({
    job: '',
    etc: '',
  });
  const [establishment, setEstablishment] = useState<string>('');
  const [address, setAddress] = useState({
    zoneCode: '',
    zoneAddress: '',
    detailAddress: '',
  });
  const [description, setDescription] = useState<string>('');
  const [settingLogo, setSettingLogo] = useState<File[]>([]);
  const [currentLogo, setCurrentLogo] = useState<string>('');

  interface UploadedImage {
    id: string;
    file: File | string;
  }
  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 2 } });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleGalleryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const compressed: UploadedImage[] = [];

      for (const file of fileArray) {
        try {
          const compressedBlob = await imageCompression(file, {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name}`;
          const compressedFile = new File([compressedBlob], file.name, { type: file.type });
          compressed.push({ id: uniqueId, file: compressedFile });
        } catch (error) {
          console.error('Image compression error:', error);
        }
      }

      setGalleryImages((prev) => {
        const total = prev.length + compressed.length;
        if (total > 5) {
          toast({
            title: '회사 전경 이미지는 최대 5개까지 업로드할 수 있습니다.',
            variant: 'warning',
          });
          return prev;
        }
        return [...prev, ...compressed];
      });
    }
    event.target.value = '';
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleGalleryDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGalleryImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.id === active.id);
      const newIndex = prev.findIndex((img) => img.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const daumPostCodeHandler = (data: Address) => {
    setAddress({
      ...address,
      zoneAddress: data.address,
      zoneCode: data.zonecode,
    });
  };

  const { data: userData } = useGetUserData();
  const { data: enterpriseProfile } = useGetEnterpriseProfile(userData?.id ?? '');
  const { mutate: postMutate, status: postStatus } = usePostEnterpriseProfile();
  const { mutate: patchMutate, status: patchStatus } = usePatchEnterpriseProfile();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSettingLogo([...settingLogo, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setSettingLogo(settingLogo.filter((_, i) => i !== index));
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const onSubmit = () => {
    if (!name?.trim()) {
      toast({
        title: '회사 이름을 입력해주세요.',
        variant: 'warning',
      });
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!industry.job) {
      toast({
        title: '업종을 선택해주세요.',
        variant: 'warning',
      });
      industryRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (industry.job === '기타' && !industry.etc) {
      toast({
        title: '기타 업종을 입력해주세요.',
        variant: 'warning',
      });
      industryEtcRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

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

    if (establishment === '0') {
      toast({
        title: '설립일을 선택해주세요.',
        variant: 'warning',
      });
      establishmentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (!description || !stripHtml(description).trim()) {
      toast({
        title: '회사 소개를 입력해주세요.',
        variant: 'warning',
      });
      descriptionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (enterpriseProfile?.length === 0) {
      return postMutate({
        name,
        industry,
        establishment,
        address,
        address_search_key: address.zoneAddress,
        description,
        settingLogo,
        settingImages: galleryImages.map((img) => img.file),
      });
    } else {
      return patchMutate({
        name,
        industry,
        establishment,
        address,
        address_search_key: address.zoneAddress,
        description,
        settingLogo,
        currentLogo,
        settingImages: galleryImages.map((img) => img.file),
        currentImages: galleryImages
          .filter((img) => typeof img.file === 'string')
          .map((img) => img.file as string),
      });
    }
  };

  const logoUrl = useMemo(() => {
    return settingLogo.length > 0 ? URL.createObjectURL(settingLogo[0]) : null;
  }, [settingLogo]);

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  useEffect(() => {
    if (
      enterpriseProfile?.length !== 0 &&
      enterpriseProfile !== undefined &&
      enterpriseProfile !== null
    ) {
      const [zoneCode, ...zoneAddress] = enterpriseProfile[0].address.split(' ');

      setCurrentLogo(enterpriseProfile[0].logo[0]);
      setName(enterpriseProfile[0].name);
      setIndustry({
        job: enterpriseProfile[0].industry_etc ? '기타' : enterpriseProfile[0].industry,
        etc: enterpriseProfile[0].industry_etc ? enterpriseProfile[0].industry : '',
      });
      setAddress({
        ...address,
        zoneCode: zoneCode,
        zoneAddress: zoneAddress.slice(0, -1).join(' '),
        detailAddress: zoneAddress.pop(),
      });
      setEstablishment(enterpriseProfile[0].establishment);
      setDescription(enterpriseProfile[0].description);

      const existingImages: UploadedImage[] = (enterpriseProfile[0].images || []).map(
        (url: string) => ({
          id: url,
          file: url,
        }),
      );
      setGalleryImages(existingImages);
    }
  }, [enterpriseProfile]);

  if (postStatus === 'pending' || patchStatus === 'pending') {
    return <GlobalSpinner />;
  }

  return (
    <div>
      {/* logo */}
      <div className='flex flex-col mb-20'>
        <label className='text-2xl font-bold mb-2'>회사 로고</label>

        <div>
          {/*  이미지가 업로드 되기 전 */}
          {!currentLogo && settingLogo.length === 0 && (
            <div className='relative flex items-center justify-center w-36 h-36 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 transition-all'>
              <input
                type='file'
                id='file-upload'
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                accept='image/*'
                onChange={handleImageUpload}
              />
              <div className='flex flex-col items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12 text-gray-400 mb-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 16V12M7 8h.01M16 12V8m0 8h.01M16 12h.01m0 0L12 16l-4-4'
                  />
                </svg>
                <span className='text-gray-600'>이미지 업로드</span>
              </div>
            </div>
          )}

          {/* 현재 상태 로고가 업로드 된 경우 */}
          {settingLogo.length > 0 && (
            <div className='relative w-20 h-20 border-gray-300'>
              <Image
                src={logoUrl ?? ''}
                alt='enterprise logo'
                className='rounded-full'
                style={{ objectFit: 'cover' }}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=='
              />

              <button
                onClick={() => removeImage(0)}
                className='absolute top-0 right-0 bg-[#000] text-white rounded p-[2px]'
              >
                <Image
                  src='/svg/close.svg'
                  alt='close'
                  width={12}
                  height={12}
                  className='invert brightness-0'
                  draggable={false}
                />
              </button>
            </div>
          )}

          {/* 이미 업로드된 로고를 가져오는 경우 */}
          {enterpriseProfile && enterpriseProfile[0]?.logo[0]?.length > 0 && currentLogo !== '' && (
            <div className='relative w-20 h-20 border-gray-300'>
              <Image
                src={currentLogo}
                alt='enterprise logo'
                className='rounded-full'
                style={{ objectFit: 'cover' }}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=='
              />

              <button
                onClick={() => setCurrentLogo('')}
                className='absolute top-0 right-0 bg-[#000] text-white rounded p-[2px]'
              >
                <Image
                  src='/svg/close.svg'
                  alt='close'
                  width={12}
                  height={12}
                  className='invert brightness-0'
                  draggable={false}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* name */}
      <div className='flex flex-col mb-20' ref={nameRef}>
        <label className='text-2xl font-bold mb-2'>
          회사 이름 <span className='text-sm text-red-500 align-top'>*</span>
        </label>
        <input
          className='border p-2 rounded'
          type='text'
          placeholder='회사 이름을 입력해 주세요'
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>

      {/* insudtry */}
      <div className='flex flex-col mb-20' ref={industryRef}>
        <p className='text-2xl font-bold mb-2'>
          업종 <span className='text-sm text-red-500 align-top'>*</span>
        </p>

        <select
          id='industry'
          name='industry'
          className={`appearance-none border p-2 mb-4 rounded ${
            industry.job === '' ? 'text-gray-400' : 'text-black'
          }`}
          value={industry.job}
          onChange={(e) => {
            setIndustry({ ...industry, job: e.target.value });
          }}
        >
          <option value='' className='text-gray-400'>
            업종을 선택해 주세요
          </option>

          {POSITIONS.map((x) => (
            <option key={x.id} value={x.position}>
              {x.position}
            </option>
          ))}
        </select>

        {industry.job === '기타' && (
          <input
            type='text'
            className='appearance-none border p-2 mb-4 rounded'
            placeholder='업종을 입력해 주세요'
            value={industry.etc}
            onChange={(e) => {
              setIndustry({
                ...industry,
                etc: e.target.value,
              });
            }}
          />
        )}
      </div>

      {/* address */}
      <div className='flex flex-col mb-20' ref={addressRef}>
        <label className='text-2xl font-bold mb-2'>
          주소 <span className='text-sm text-red-500 align-top'>*</span>
        </label>

        <button
          className='py-2 px-4 bg-[#4C71C0] text-white font-bold w-fit rounded mb-2'
          onClick={() => open({ onComplete: daumPostCodeHandler })}
        >
          주소 찾기
        </button>

        {address.zoneCode && address.zoneAddress && (
          <>
            <input
              type='text'
              value={
                address.zoneCode && address.zoneAddress
                  ? `[${address.zoneCode}] ${address.zoneAddress}`
                  : ''
              }
              readOnly
              disabled
              className='border p-2 mb-2 rounded'
            />

            <input
              type='text'
              onChange={(e) => setAddress({ ...address, detailAddress: e.target.value })}
              value={address.detailAddress}
              placeholder='상세 주소 입력'
              className='border p-2 rounded'
            />
          </>
        )}
      </div>

      {/* establishment */}
      <div className='flex flex-col mb-20' ref={establishmentRef}>
        <label className='text-2xl font-bold mb-2'>
          설립일 <span className='text-sm text-red-500 align-top'>*</span>
        </label>

        <DatePicker
          className='px-2 py-2 border rounded'
          selected={
            establishment && /^\d{4}-\d{2}-\d{2}$/.test(establishment)
              ? parse(establishment, 'yyyy-MM-dd', new Date())
              : null
          }
          onChange={(date: Date | null) => {
            if (date) {
              setEstablishment(format(date, 'yyyy-MM-dd'));
            }
          }}
          locale={ko}
          dateFormat='yyyy년'
          showYearPicker
          placeholderText='설립일을 선택하세요'
        />
      </div>

      {/* description */}
      <div className='flex flex-col mb-4' ref={descriptionRef}>
        <label className='text-2xl font-bold mb-2'>
          회사 소개 <span className='text-sm text-red-500 align-top'>*</span>
        </label>

        <TextEditor
          initialContent={description}
          onChange={(content) => setDescription(content)}
          className='border p-2 rounded focus:outline-none'
          placeholder='내용을 입력하세요...'
        />
      </div>

      {/* gallery images */}
      <div className='flex flex-col mt-20 mb-4'>
        <label className='text-2xl font-bold mb-2'>회사 전경 이미지</label>

        <div className='text-xs p-2 bg-[#EAEAEC] rounded break-keep mb-2'>
          <p className='font-bold text-sm'>• 이미지는 최대 5개까지 업로드 가능해요</p>
          <p className='text-sm'>
            • <span className='font-bold'>가로 방향</span>의 사진이 회사의 전체적인 모습을 더 잘
            보여줄 수 있습니다.
          </p>
          <p className='text-sm'>• 이미지 파일 확장자는 jpg, jpeg, png, webp만 지원해요.</p>
          <p className='text-sm'>• 이미지를 드래그하면 순서를 변경할 수 있어요.</p>
        </div>

        <label className='relative py-1 px-4 bg-[#4C71C0] text-white font-bold w-fit rounded cursor-pointer'>
          <div className='flex gap-2 items-center justify-center'>
            <Image
              src='/svg/upload.svg'
              alt='upload'
              width={32}
              height={32}
              className='invert brightness-0'
            />
            <p className='text-sm text-white'>이미지 업로드</p>
          </div>
          <input
            type='file'
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            multiple
            accept='image/jpeg, image/jpg, image/png, image/webp'
            onChange={handleGalleryImageUpload}
          />
        </label>

        {galleryImages.length > 0 && <div className='border border-gray-300 my-4'></div>}

        <DndContext sensors={sensors} onDragEnd={handleGalleryDragEnd}>
          <SortableContext
            items={galleryImages.map((img) => img.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className='flex flex-wrap gap-3'>
              {galleryImages.map((img, index) => (
                <SortableImageDnd
                  key={img.id}
                  id={img.id}
                  index={index}
                  image={img.file}
                  onRemove={() => removeGalleryImage(img.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className='flex justify-center mt-10'>
        <button
          className='px-4 py-2 bg-[#4C71C0] text-white rounded w-fit'
          onClick={() => onSubmit()}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
