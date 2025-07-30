'use client';

import { useState, useEffect } from 'react';
import { CommonDialog } from '@/components/common/common-dialog';
import { Button } from '@/components/common/button';
import { MessageIconType, IconComponents } from '.';

export interface ConfirmOptions {
  title?: string;
  message: string;
  icon?: MessageIconType;
  confirmText?: string;
  cancelText?: string;
}

const confirmControl = {
  options: { message: '' } as ConfirmOptions,
  resolve: null as ((value: boolean) => void) | null,
  update: null as ((isOpen: boolean, options: ConfirmOptions) => void) | null,
};

export const ConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });

  useEffect(() => {
    confirmControl.update = (isOpen, options) => {
      setIsOpen(isOpen);
      setOptions(options);
    };

    return () => {
      confirmControl.update = null;
    };
  }, []);

  const handleClose = (result: boolean) => {
    setIsOpen(false);
    if (confirmControl.resolve) {
      confirmControl.resolve(result);
      confirmControl.resolve = null;
    }
  };

  const footer = (
    <div className='flex justify-end w-full mt-2'>
      <Button variant='outline' size='sm' onClick={() => handleClose(false)}>
        {options.cancelText || '취소'}
      </Button>
      <Button variant='default' size='sm' onClick={() => handleClose(true)}>
        {options.confirmText || '확인'}
      </Button>
    </div>
  );

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose(false)}
      title={options.title}
      description={options.message}
      footer={footer}
      contentClassName='max-w-[400px] w-[90%]'
      className='flex flex-col items-center text-center'
      headerClassName='flex flex-row items-center gap-3'
    >
      <div className='flex items-center flex-col gap-2'>
        {options.icon && IconComponents[options.icon]}
      </div>
    </CommonDialog>
  );
};

export const confirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    confirmControl.options = options;
    confirmControl.resolve = resolve;

    if (confirmControl.update) {
      confirmControl.update(true, options);
    }
  });
};
