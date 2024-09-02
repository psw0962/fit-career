'use client';

import { useRef } from 'react';
import { usePostUploaFile } from '@/actions/storage-actions';

const FileUpload = () => {
  const fileRef = useRef(null as any);

  const { mutate, isLoading }: any = usePostUploaFile();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const file = fileRef.current.files[0];
        if (file) {
          console.log(file);
          const formData = new FormData();
          formData.append('file', file);
          console.log(formData);
          //   const result = await mutate(formData);
        } else {
          console.log('null');
        }
      }}
      className="w-full py-20 border-4 border-dotted border-indigo-700 flex flex-col items-center justify-center"
    >
      <input ref={fileRef} type="file" className="" />

      <p>파일을 여기에 끌어다 놓거나 클릭하여 업로드하세요.</p>

      {isLoading && <div>로딩중...</div>}

      <button type="submit">파일 업로드</button>
    </form>
  );
};

export default FileUpload;
