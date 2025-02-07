import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

interface SortableImageDndProps {
  id: number | string;
  index: number;
  image: File | string;
  onRemove: (index: number) => void;
}

export default function SortableImageDnd({
  id,
  index,
  image,
  onRemove,
}: SortableImageDndProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      cursor: 'grab',
      touchAction: 'none',
    }),
    [transform, transition, isDragging]
  );

  const imageUrl = useMemo(() => {
    if (typeof image === 'string') {
      return image;
    } else if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return '';
  }, [image]);

  useEffect(() => {
    if (!(typeof image === 'string') && image instanceof File) {
      const url = URL.createObjectURL(image);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [image]);

  return (
    <div
      ref={setNodeRef}
      className="relative w-16 h-16 sm:w-24 sm:h-24 border rounded select-none touch-none"
      style={{
        ...style,
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      <Image
        src={imageUrl}
        alt={`uploaded ${id}`}
        className="w-full h-full rounded cursor-grab select-none"
        draggable={false}
        style={{
          objectFit: 'cover',
          WebkitTouchCallout: 'none',
        }}
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3C/svg%3E"
        quality={75}
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
          className="w-4 h-4 invert brightness-0"
          draggable={false}
        />
      </button>
    </div>
  );
}
