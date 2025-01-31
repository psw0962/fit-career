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
          objectFit: 'contain',
          WebkitTouchCallout: 'none',
        }}
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        blurDataURL="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
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
};
