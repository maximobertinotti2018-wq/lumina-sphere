import { MainLayout } from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <MainLayout mood="classic">
      <div className="max-w-4xl mx-auto space-y-6 pt-12">
        <EmptyState 
          icon={<SearchX className="w-12 h-12" />}
          title="Página no encontrada"
          description="La página que buscas no existe o ha sido movida."
          action={{ label: "Volver al inicio", href: "/" }}
        />
      </div>
    </MainLayout>
  );
}
