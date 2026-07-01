import { MainLayout } from '@/components/layout/MainLayout';
import { Music as MusicIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MusicPage() {
  return (
    <MainLayout mood="classic">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Música recomendada</h1>
        <EmptyState 
          icon={<MusicIcon className="w-12 h-12" />}
          title="Modo inmersivo"
          description="Abre un libro para ver playlists de Spotify recomendadas basadas en su atmósfera."
        />
      </div>
    </MainLayout>
  );
}
