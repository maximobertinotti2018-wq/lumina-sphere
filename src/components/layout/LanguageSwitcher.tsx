"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleLanguage}
      className="font-bold text-xs uppercase"
    >
      {language}
    </Button>
  );
}
