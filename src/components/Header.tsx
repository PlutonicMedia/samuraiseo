import { useLanguage } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import samuraiLogo from "@/assets/samurai-logo.png";

const Header = () => {
  const { t, toggleLanguage } = useLanguage();

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <img src={samuraiLogo} alt="Samurai SEO" className="h-18 w-auto" />
        <span className="text-xs text-muted-foreground hidden sm:inline">{t("poweredBy") as string}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="gap-2 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
      >
        <Globe className="h-4 w-4" />
        {t("langSwitch") as string}
      </Button>
    </header>
  );
};

export default Header;
