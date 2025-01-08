import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';
import Image from 'next/image';
type SortableImageDndProps = {
  id: number;
  index: number;
  image: File;
  onRemove: (index: number) => void;
};

export const SortableImageDnd = ({
  id,
  index,
  image,
  onRemove,
}: SortableImageDndProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-32 h-32 border rounded touch-none"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 cursor-move bg-gray-200 p-1 rounded touch-none"
      >
        <Image
          src="/svg/draggable.svg"
          alt="draggable"
          width={14}
          height={16}
          draggable={false}
        />
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={`uploaded ${id}`}
          className="w-full h-full object-cover rounded"
        />
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-1 right-1 bg-[#000] text-white rounded p-1"
      >
        <Image
          src="/svg/close.svg"
          alt="close"
          width={14}
          height={16}
          className="invert brightness-0"
          draggable={false}
        />
      </button>
    </div>
  );
};
