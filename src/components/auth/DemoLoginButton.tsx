'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo';

interface DemoLoginButtonProps {
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

/**
 * Botón "Probar demo": entra con la cuenta demo pública de un clic, sin registro.
 * Pensado para visitantes de portfolio que quieren ver la app sin fricción.
 */
export function DemoLoginButton({
  variant = 'primary',
  size = 'lg',
  className,
  label = 'Probar demo',
}: DemoLoginButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    if (res?.error) {
      setError('No se pudo abrir la demo. Probá de nuevo en un momento.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleDemo}
        disabled={loading}
        variant={variant}
        size={size}
        className="w-full sm:w-auto"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? 'Abriendo demo…' : label}
      </Button>
      {error && (
        <p className="text-red-400 text-sm mt-2 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
