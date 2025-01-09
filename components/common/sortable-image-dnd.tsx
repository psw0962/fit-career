import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

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
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const imageUrl: string = isUrl
    ? (image as string)
    : URL.createObjectURL(image as File);

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
          width={16}
          height={16}
          draggable={false}
        />
      </div>

      <img
        src={imageUrl}
        alt={`uploaded ${id}`}
        className="w-full h-full object-cover rounded"
      />

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
          width={16}
          height={16}
          className="invert brightness-0"
          draggable={false}
        />
      </button>
    </div>
  );
};
