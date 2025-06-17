'use client';

import { AlertCircle, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { alert, AlertDialog, AlertOptions } from './alert';
import { confirm, ConfirmDialog, ConfirmOptions } from './confirm';

export type MessageIconType = 'success' | 'error' | 'warning' | 'info' | 'question';

export const IconComponents: Record<MessageIconType, React.ReactNode> = {
  success: <CheckCircle className='h-6 w-6 text-green-500' />,
  error: <XCircle className='h-6 w-6 text-red-500' />,
  warning: <AlertCircle className='h-6 w-6 text-amber-500' />,
  info: <AlertCircle className='h-6 w-6 text-blue-500' />,
  question: <HelpCircle className='h-6 w-6 text-gray-500' />,
};

export { AlertDialog, ConfirmDialog };

const message = {
  alert,
  confirm,
};

export type { AlertOptions, ConfirmOptions };
export default message;
