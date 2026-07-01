import { GlassPanel } from './GlassPanel';
import { Button } from './Button';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
      <GlassPanel className="p-8 flex flex-col items-center max-w-md w-full" variant="strong">
        <div className="text-white/40 mb-6 bg-white/5 p-4 rounded-full">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/60 mb-8">{description}</p>
        
        {action && (
          action.href ? (
            <Link href={action.href} className="w-full">
              <Button variant="primary" className="w-full">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={action.onClick} className="w-full">
              {action.label}
            </Button>
          )
        )}
      </GlassPanel>
    </div>
  );
}
