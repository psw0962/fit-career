'use client';

import { useState, useEffect } from 'react';
import { CommonDialog } from '@/components/common/common-dialog';
import { Button } from '@/components/common/button';
import { MessageIconType, IconComponents } from '.';

export interface AlertOptions {
  title?: string;
  message: string;
  icon?: MessageIconType;
  confirmText?: string;
}

const alertControl = {
  options: { message: '' } as AlertOptions,
  resolve: null as ((value: void) => void) | null,
  update: null as ((isOpen: boolean, options: AlertOptions) => void) | null,
};

export const AlertDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({ message: '' });

  useEffect(() => {
    alertControl.update = (isOpen, options) => {
      setIsOpen(isOpen);
      setOptions(options);
    };

    return () => {
      alertControl.update = null;
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (alertControl.resolve) {
      alertControl.resolve();
      alertControl.resolve = null;
    }
  };

  const footer = (
    <div className='flex justify-end w-full mt-2'>
      <Button onClick={handleClose}>{options.confirmText || '확인'}</Button>
    </div>
  );

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
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

export const alert = (options: AlertOptions): Promise<void> => {
  return new Promise<void>((resolve) => {
    alertControl.options = options;
    alertControl.resolve = resolve;

    if (alertControl.update) {
      alertControl.update(true, options);
    }
  });
};
