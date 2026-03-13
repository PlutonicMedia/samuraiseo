import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import trustReaktion from "@/assets/trust-reaktion.png";
import trustSearchAwards from "@/assets/trust-search-awards.png";
import trustPlaza from "@/assets/trust-plaza.png";

export const TrustBannerPlaza = () => {
  const { t } = useLanguage();
  const stats = [
    t("trustPlazaStat1") as string,
    t("trustPlazaStat2") as string,
    t("trustPlazaStat3") as string,
    t("trustPlazaStat4") as string,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="mt-4 bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden"
    >
      <div className="flex flex-col gap-4 p-4">
        <img
          src={trustPlaza}
          alt="Plaza Case Study"
          className="w-full max-w-md mx-auto rounded-lg"
          loading="lazy"
        />
        <div>
          <h4 className="font-sora font-semibold text-primary text-sm mb-2 text-center">
            {t("trustPlazaTitle") as string}
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {stats.map((stat) => (
              <div key={stat} className="bg-accent/15 rounded-md px-2 py-1.5 text-center">
                <span className="text-xs font-semibold text-primary">{stat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TrustBannerAwards = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="mt-4 flex flex-col gap-3 items-center"
    >
      <img
        src={trustReaktion}
        alt={t("trustAward1") as string}
        className="w-full rounded-lg border border-border/50 shadow-sm object-cover"
        loading="lazy"
      />
      <img
        src={trustSearchAwards}
        alt={t("trustAward2") as string}
        className="max-w-[200px] w-full rounded-lg border border-border/50 shadow-sm object-contain"
        loading="lazy"
      />
    </motion.div>
  );
};
