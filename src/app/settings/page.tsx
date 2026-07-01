"use client";

import { useSession } from "next-auth/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { t, language, setLanguage } = useLanguage();

  const userTier = (session?.user as any)?.subscriptionTier || "starter";

  return (
    <MainLayout mood="classic">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">{t("settings.title") || "Ajustes"}</h1>

        <GlassPanel className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">{t("settings.profile") || "Perfil"}</h2>
          <div>
            <label className="block text-sm text-white/60 mb-1">Email</label>
            <p className="text-white">{session?.user?.email}</p>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">{t("settings.tier") || "Suscripción"}</label>
            <p className="text-white capitalize">{userTier}</p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">{t("settings.preferences") || "Preferencias"}</h2>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">{t("settings.language") || "Idioma"}</label>
            <div className="flex gap-4">
              <Button
                variant={language === "es" ? "primary" : "outline"}
                onClick={() => setLanguage("es")}
              >
                Español
              </Button>
              <Button
                variant={language === "en" ? "primary" : "outline"}
                onClick={() => setLanguage("en")}
              >
                English
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2 mt-4">{t("settings.theme") || "Tema inmersivo"}</label>
            <div className="flex gap-4 flex-wrap">
              <Button variant="outline">Classic</Button>
              <Button variant="outline">Berserk</Button>
              <Button variant="outline">Fullmetal Alchemist</Button>
            </div>
            <p className="text-xs text-white/40 mt-2">Los temas persistirán pronto.</p>
          </div>
        </GlassPanel>
      </div>
    </MainLayout>
  );
}
