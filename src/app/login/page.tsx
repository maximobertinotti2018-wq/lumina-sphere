"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(t("login.error") || "Credenciales inválidas.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassPanel className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{t("login.title") || "Iniciar sesión"}</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("login.password") || "Contraseña"}</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading} variant="primary">
            {loading ? "..." : (t("login.submit") || "Entrar")}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <span className="text-sm text-gray-400">o</span>
        </div>

        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mt-4">
          Continuar con Google
        </Button>

        <p className="mt-6 text-center text-sm">
          {t("login.noAccount") || "¿No tienes cuenta?"}{" "}
          <Link href="/register" className="text-primary hover:underline">
            {t("login.register") || "Regístrate"}
          </Link>
        </p>
      </GlassPanel>
    </div>
  );
}
