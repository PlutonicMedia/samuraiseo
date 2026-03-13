import { useLanguage } from "@/i18n/LanguageContext";
import trustReaktion from "@/assets/trust-reaktion.png";
import trustSearchAwards from "@/assets/trust-search-awards.png";
import trustPlaza from "@/assets/trust-plaza.png";

const TrustSidebar = () => {
  const { t } = useLanguage();

  const stats = [
    t("trustPlazaStat1") as string,
    t("trustPlazaStat2") as string,
    t("trustPlazaStat3") as string,
    t("trustPlazaStat4") as string,
  ];

  return (
    <aside className="space-y-6">
      {/* Plutonic branding */}
      <div className="bg-card rounded-lg p-5 border border-border/50 shadow-sm">
        <h3 className="font-sora font-bold text-primary text-lg mb-2">
          {t("trustTitle") as string}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("trustDesc") as string}
        </p>
      </div>

      {/* Plaza case */}
      <div className="bg-card rounded-lg overflow-hidden border border-border/50 shadow-sm">
        <img
          src={trustPlaza}
          alt="Plaza Case Study by Plutonic Media"
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        <div className="p-4">
          <h4 className="font-sora font-semibold text-primary text-sm mb-3">
            {t("trustPlazaTitle") as string}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat) => (
              <div
                key={stat}
                className="bg-accent/15 rounded-md px-3 py-2 text-center"
              >
                <span className="text-xs font-semibold text-primary">{stat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards */}
      <div className="space-y-3">
        <img
          src={trustReaktion}
          alt={t("trustAward1") as string}
          className="w-full h-auto rounded-lg border border-border/50 shadow-sm"
          loading="lazy"
        />
        <img
          src={trustSearchAwards}
          alt={t("trustAward2") as string}
          className="w-full h-auto rounded-lg border border-border/50 shadow-sm"
          loading="lazy"
        />
      </div>
    </aside>
  );
};

export default TrustSidebar;
