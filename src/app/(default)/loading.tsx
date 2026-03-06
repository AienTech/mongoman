import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='p-6 space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>
      <Skeleton className='h-px w-full' />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-48 w-full' />
      </div>
      <Skeleton className='h-64 w-full' />
    </div>
  );
}
