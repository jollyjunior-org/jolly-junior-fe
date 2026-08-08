import { Loader } from '@/components/common/Loader';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader text="Loading..." size="lg" />
    </div>
  );
}
