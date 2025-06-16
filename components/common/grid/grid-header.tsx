import React from 'react';
import { Button } from '@/components/ui/button';
import { CirclePlus, Download, Fullscreen, RotateCcw, Save, Trash2, Upload } from 'lucide-react';

interface AgGridHeaderProps {
  children: React.ReactNode;
  title?: string;
  fullScreen?: () => void;
  reset?: () => void;
  add?: () => void;
  delete?: () => void;
  upload?: () => void;
  download?: () => void;
  save?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function GridHeader({
  children,
  title,
  reset,
  add,
  delete: handleDelete,
  upload,
  download,
  save,
  fullScreen,
  className = '',
  style,
}: AgGridHeaderProps) {
  return (
    <div
      className={`rounded-xl border shadow-sm overflow-hidden bg-white ${className}`}
      style={style}
    >
      <div className="p-4 border-b flex items-center justify-between">
        {title && <h3 className="text-lg font-medium">{title}</h3>}

        <div className="flex flex-wrap justify-end gap-3">
          {add && (
            <Button variant="ghost" size="sm" onClick={add} className="h-5 w-5 p-0">
              <CirclePlus size={20} />
            </Button>
          )}

          {handleDelete && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="h-5 w-5 p-0">
              <Trash2 size={20} />
            </Button>
          )}

          {save && (
            <Button variant="ghost" size="sm" onClick={save} className="h-5 w-5 p-0">
              <Save size={20} />
            </Button>
          )}

          {upload && (
            <Button variant="ghost" size="sm" onClick={upload} className="h-5 w-5 p-0">
              <Upload size={20} />
            </Button>
          )}

          {download && (
            <Button variant="ghost" size="sm" onClick={download} className="h-5 w-5 p-0">
              <Download size={20} />
            </Button>
          )}

          {reset && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-5 w-5 p-0">
              <RotateCcw size={20} />
            </Button>
          )}

          {fullScreen && (
            <Button variant="ghost" size="sm" onClick={fullScreen} className="h-5 w-5 p-0">
              <Fullscreen size={20} />
            </Button>
          )}
        </div>
      </div>

      <div className="p-0">{children}</div>
    </div>
  );
}
