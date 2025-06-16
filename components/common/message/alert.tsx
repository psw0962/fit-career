'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[400px] w-[90%] flex flex-col items-center">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="flex items-center flex-col gap-2">
            {options.icon && IconComponents[options.icon]}
            {options.title && <DialogTitle>{options.title}</DialogTitle>}
          </div>
        </DialogHeader>

        <DialogDescription className="text-base py-2 whitespace-pre-line text-center">
          {options.message}
        </DialogDescription>

        <DialogFooter className="flex justify-end w-full mt-2">
          <Button onClick={handleClose}>{options.confirmText || '확인'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
