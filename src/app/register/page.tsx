"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { registerUser } from "@/lib/actions/authActions";

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/login");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassPanel className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{t("register.title") || "Crear cuenta"}</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("register.password") || "Contraseña"}</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Mín. 8 chars, 1 letra, 1 número"
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading} variant="primary">
            {loading ? "..." : (t("register.submit") || "Registrarse")}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <span className="text-sm text-gray-400">o</span>
        </div>

        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mt-4">
          Continuar con Google
        </Button>

        <p className="mt-6 text-center text-sm">
          {t("register.hasAccount") || "¿Ya tienes cuenta?"}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("register.login") || "Inicia sesión"}
          </Link>
        </p>
      </GlassPanel>
    </div>
  );
}
