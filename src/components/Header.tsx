import { useLanguage } from "@/i18n/LanguageContext";
import { Globe, Phone, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import plutonicLogo from "@/assets/plutonic-logo.png";

const Header = () => {
  const { t, toggleLanguage, language } = useLanguage();

  return (
    <header className="w-full py-3 px-4 md:px-6 border-b border-border/50 sticky top-0 z-50" style={{ backgroundColor: "#224842" }}>
      <div className="relative flex items-center justify-between min-h-[3.5rem]">
        {/* Left: Contact icons */}
        <div className="flex items-center gap-2 md:gap-3 z-10">
          <span className="text-white/80 text-sm hidden md:inline">
            {language === "da" ? "Har du nogle spørgsmål?" : "Have any questions?"}
          </span>
          <a
            href="tel:+4581826460"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            aria-label="Phone"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href="mailto:info@plutonic.dk"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>

        {/* Center: Logo (absolutely centered) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="https://samurai.plutonic.dk/">
            <img src={plutonicLogo} alt="Samurai SEO" className="h-14 w-auto" />
          </a>
        </div>

        {/* Right: Start over + Language toggle */}
        <div className="z-10 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { window.location.href = "/"; }}
            className="gap-2 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">{t("startOver") as string}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white transition-all"
          >
            <Globe className="h-4 w-4" />
            {t("langSwitch") as string}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
