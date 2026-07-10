import Link from 'next/link';
import { BookOpen, MessageCircle, Clapperboard, Music, Sparkles, Library } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { DemoLoginButton } from '@/components/auth/DemoLoginButton';
import { DEMO_ENABLED } from '@/lib/demo';

/**
 * Landing pública para visitantes sin sesión.
 * Objetivo: que en 10 segundos se entienda qué es Lumina y den ganas de probarla.
 * Server component estático: carga rápido y es indexable.
 */
export function LandingPage() {
  const features = [
    {
      icon: <BookOpen className="w-7 h-7 text-purple-300" />,
      title: 'Leé donde quieras',
      description:
        'Subí tus EPUB o PDF, o traé clásicos gratis de dominio público. Tu progreso, notas y marcadores te siguen a todos lados.',
    },
    {
      icon: <MessageCircle className="w-7 h-7 text-blue-300" />,
      title: 'Chateá con los personajes',
      description:
        'La IA lee tu libro y le da voz a sus protagonistas. Preguntale a la heroína qué sintió en ese capítulo.',
    },
    {
      icon: (
        <span className="flex gap-1">
          <Clapperboard className="w-7 h-7 text-pink-300" />
          <Music className="w-7 h-7 text-green-300" />
        </span>
      ),
      title: 'Viví su universo',
      description:
        'Cada libro tiene una vibra. Lumina te recomienda películas afines y playlists para acompañar la lectura.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#12101c] to-[#0a0812] text-white overflow-x-hidden">
      {/* Glow decorativo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.25),transparent_60%)]" />

      {/* Nav mínima */}
      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">Lumina Sphere</span>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm">Iniciar sesión</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-16 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-200 text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          Tu biblioteca, con inteligencia artificial
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
          Leé un libro.
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Viví su universo.
          </span>
        </h1>
        <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Lumina Sphere convierte cada lectura en una experiencia completa: un lector
          hermoso, charlas con los personajes y la banda sonora perfecta para cada historia.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {DEMO_ENABLED && <DemoLoginButton variant="primary" size="lg" label="Probar demo" />}
          <Link href="/register">
            <Button variant={DEMO_ENABLED ? 'outline' : 'primary'} size="lg" className="w-full sm:w-auto">
              Crear cuenta gratis
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
        <p className="text-white/30 text-sm mt-4">
          {DEMO_ENABLED
            ? 'Entrá a la demo sin registrarte. Gratis hasta 5 libros. Sin tarjeta.'
            : 'Gratis hasta 5 libros. Sin tarjeta.'}
        </p>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <GlassPanel key={f.title} variant="default" className="p-8 space-y-4" hover>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {f.icon}
              </div>
              <h2 className="text-xl font-semibold">{f.title}</h2>
              <p className="text-white/60 leading-relaxed">{f.description}</p>
            </GlassPanel>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <GlassPanel variant="strong" className="p-10 space-y-5">
          <Library className="w-10 h-10 text-purple-300 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold">
            Tu próxima gran lectura te está esperando
          </h2>
          <p className="text-white/60">
            Empezá con un clásico gratis de dominio público y descubrí de qué se trata.
          </p>
          <Link href="/register" className="inline-block">
            <Button variant="primary" size="lg">Empezar a leer</Button>
          </Link>
        </GlassPanel>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-white/30 text-sm">
        Lumina Sphere — The Immersive Culture OS
      </footer>
    </div>
  );
}
