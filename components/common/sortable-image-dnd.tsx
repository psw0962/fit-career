import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

interface SortableImageDndProps {
  id: number;
  index: number;
  image: File | string;
  onRemove: (index: number) => void;
  isUrl?: boolean;
}

export const SortableImageDnd = ({
  id,
  index,
  image,
  onRemove,
  isUrl,
}: SortableImageDndProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
    animateLayoutChanges: () => false,
    disabled: false,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      cursor: 'grab',
    }),
    [transform, transition, isDragging]
  );

  const imageUrl = useMemo(
    () => (isUrl ? (image as string) : URL.createObjectURL(image as File)),
    [image, isUrl]
  );

  useEffect(() => {
    if (!isUrl) {
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, [imageUrl, isUrl]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-16 sm:w-24 h-16 sm:h-24 border rounded select-none"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 cursor-move bg-white/80 hover:bg-white p-[2px] rounded-md shadow-sm z-10 select-none"
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Image
          src="/svg/draggable.svg"
          alt="draggable"
          width={16}
          height={16}
          draggable={false}
          className="w-3 h-3 sm:w-4 sm:h-4 pointer-events-none"
        />
      </div>

      <Image
        src={imageUrl}
        alt={`uploaded ${id}`}
        className="w-full h-full rounded"
        style={{ objectFit: 'contain' }}
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-1 right-1 bg-[#000] text-white rounded p-[2px]"
      >
        <Image
          src="/svg/close.svg"
          alt="close"
          width={16}
          height={16}
          className="w-3 h-3 sm:w-4 sm:h-4 invert brightness-0"
          draggable={false}
        />
      </button>
    </div>
  );
};
