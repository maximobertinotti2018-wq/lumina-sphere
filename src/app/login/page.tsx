"use client";

import { useEffect, useState } from "react";
import { signIn, getProviders } from "next-auth/react";
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
  const [hasGoogle, setHasGoogle] = useState(false);

  // Mensaje de éxito si venimos del registro (?registered=1).
  const [justRegistered] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("registered")
  );

  // Solo mostramos el botón de Google si el provider está configurado en el server.
  useEffect(() => {
    getProviders().then((providers) => setHasGoogle(!!providers?.google)).catch(() => {});
  }, []);

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
      setError(t("login.error"));
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
        <h1 className="text-2xl font-bold text-center mb-6">{t("login.title")}</h1>
        {justRegistered && !error && (
          <p className="text-green-400 mb-4 text-center text-sm" role="status">
            {t("register.success")}
          </p>
        )}
        {error && <p className="text-red-400 mb-4 text-center text-sm" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1">{t("login.password")}</label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading} variant="primary">
            {loading ? "..." : t("login.submit")}
          </Button>
        </form>

        {hasGoogle && (
          <>
            <div className="mt-6 flex items-center justify-center">
              <span className="text-sm text-gray-400">o</span>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mt-4">
              {t("auth.continueWithGoogle")}
            </Button>
          </>
        )}

        <p className="mt-6 text-center text-sm">
          {t("login.noAccount")}{" "}
          <Link href="/register" className="text-primary hover:underline">
            {t("login.register")}
          </Link>
        </p>
      </GlassPanel>
    </div>
  );
}
