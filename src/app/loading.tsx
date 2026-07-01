import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <MainLayout>
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    </MainLayout>
  );
}
