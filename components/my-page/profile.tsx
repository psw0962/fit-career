'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useDeleteAllUserData, useGetUserData } from '@/actions/auth';
import { deleteUser } from '@/actions/server-action';
import GlobalSpinner from '@/components/common/global-spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Profile = (): React.ReactElement => {
  const { toast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgree, setIsAgree] = useState(false);

  const { data: userData, isLoading: userDataLoading } = useGetUserData();
  const { mutateAsync: deleteAllUserData, status: deleteAllUserDataStatus } =
    useDeleteAllUserData();

  const onDeleteUser = async () => {
    if (!userData?.id) return;

    try {
      setIsDeleting(true);
      setIsModalOpen(false);
      setIsAgree(false);

      await deleteAllUserData();
      await deleteUser(userData.id);

      window.location.href = '/';
    } catch (error) {
      console.error(error);
      toast({
        title: '회원 탈퇴 중 오류가 발생했습니다.',
        description: '네트워크 에러, 잠시 후 다시 시도해주세요.',
        variant: 'warning',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (
    userDataLoading ||
    !userData ||
    deleteAllUserDataStatus === 'pending' ||
    isDeleting
  ) {
    return <GlobalSpinner />;
  }

  return (
    <div className="mt-5 flex flex-col">
      <div className="flex flex-col gap-2 items-start sm:flex-row sm:items-center">
        <div className="relative w-20 h-20">
          <Image
            className="rounded-full"
            src={
              userData.user_metadata?.avatar_url
                ? userData.user_metadata?.avatar_url
                : '/svg/logo.svg'
            }
            alt="user-avatar"
            fill
            priority
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
            quality={75}
          />
        </div>

        <div className="flex-col">
          <p className="text-xl">{userData.user_metadata?.name}</p>
          <p>{userData.user_metadata?.email}</p>

          {userData.app_metadata?.provider !== 'kakao' && (
            <>
              <p>{userData.email}</p>
              <p>Admin</p>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setIsAgree(false);
        }}
      >
        <DialogTrigger asChild>
          <button
            className="self-end text-sm ml-2 font-bold text-[#C3C4C5] underline underline-offset-4 decoration-[#C3C4C5]"
            onClick={() => setIsModalOpen(true)}
          >
            회원탈퇴
          </button>
        </DialogTrigger>

        <DialogContent className="w-[90vw] max-w-[500px] min-w-[300px]">
          <DialogHeader>
            <DialogTitle>회원 탈퇴</DialogTitle>
            <DialogDescription>
              회원 탈퇴 시 해당 아이디로 활동했던 모든 기록과 개인정보가
              삭제되고 복구할 수 없습니다.(게시글, 댓글, 이미지, 이력서 등)
              <br />
              정말로 탈퇴하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mt-5">
            <input
              type="checkbox"
              id="agree"
              checked={isAgree}
              onChange={() => setIsAgree(!isAgree)}
            />
            <label htmlFor="agree">동의합니다.</label>
          </div>

          <DialogFooter>
            <button
              className={`w-full sm:w-fit ${
                isAgree
                  ? 'bg-[#4C71BF] text-white'
                  : 'bg-[#C3C4C5] text-gray-500'
              } mt-4 px-4 py-2 rounded self-end`}
              disabled={!isAgree}
              onClick={onDeleteUser}
            >
              탈퇴하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
