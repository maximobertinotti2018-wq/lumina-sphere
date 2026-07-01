'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MainLayout>
      <div className="flex h-[80vh] items-center justify-center p-4">
        <GlassPanel variant="strong" className="p-8 max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-white/60">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <Button variant="primary" onClick={() => reset()} className="w-full">
            Try again
          </Button>
        </GlassPanel>
      </div>
    </MainLayout>
  );
}
