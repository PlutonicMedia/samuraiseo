import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { trackCustomEvent } from "@/lib/facebook-pixel";
import { toast } from "sonner";
import { Clock, Package, ArrowRight, Send, CalendarDays, FileText, X, Globe, Quote, Link, Zap, Trophy, Cpu } from "lucide-react";
import { z } from "zod";
import reaktionBadge from "@/assets/reaktion-winner.png";
import searchAwardsBadge from "@/assets/european-search-awards.png";
import askeImg from "@/assets/aske-frederiksen.jpg";
import kasperImg from "@/assets/kasper-plutonic.jpg";
import peterImg from "@/assets/peter-plutonic.png";
import oliverImg from "@/assets/oliver-plutonic.png";

interface ResultsSectionProps {
  answers: {
    productCount: number;
    expectedVolume: number;
    timePerItem: number;
    revenueRange: string;
  };
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(30),
  email: z.string().trim().email().max(255),
  company: z.string().trim().min(1).max(200),
});

function useAnimatedCounter(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };
    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration]);

  return value;
}

type ResultPage = "pain" | "solution";
type CTAState = "idle" | "form" | "meeting" | "declined";

interface Specialist {
  key: string;
  nameKey: string;
  urlField: string;
  initials: string;
  img: string;
}

const specialists: Specialist[] = [
  { key: "kasper", nameKey: "specialistKasper", urlField: "hubspot_url_kasper", initials: "K", img: kasperImg },
  { key: "peter", nameKey: "specialistPeter", urlField: "hubspot_url_peter", initials: "P", img: peterImg },
  { key: "oliver", nameKey: "specialistOliver", urlField: "hubspot_url_oliver", initials: "O", img: oliverImg },
];

const ResultsSection = ({ answers }: ResultsSectionProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [page, setPage] = useState<ResultPage>("pain");
  const [ctaState, setCTAState] = useState<CTAState>("idle");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", company: "" });
  const [seoUrl, setSeoUrl] = useState("");
  const [seoEmail, setSeoEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittingSeo, setSubmittingSeo] = useState(false);
  const [specialistUrls, setSpecialistUrls] = useState<Record<string, string>>({});
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);

  const userMonthlyHours = Math.round((answers.expectedVolume * answers.timePerItem) / 60);
  const userTotalOptimizationHours = Math.round((answers.productCount * answers.timePerItem) / 60);

  const animatedMonthlyHours = useAnimatedCounter(userMonthlyHours);
  const animatedProductCount = useAnimatedCounter(answers.productCount);
  const animatedOptHours = useAnimatedCounter(userTotalOptimizationHours);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("hubspot_calendar_url, hubspot_url_kasper, hubspot_url_peter, hubspot_url_oliver")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSpecialistUrls({
            kasper: (data as any).hubspot_url_kasper || "",
            peter: (data as any).hubspot_url_peter || "",
            oliver: (data as any).hubspot_url_oliver || "",
          });
        }
      });
  }, []);

  const activeHubspotUrl = selectedSpecialist ? specialistUrls[selectedSpecialist] : null;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(contact);
    if (!result.success) {
      toast.error("Please fill all fields correctly.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("quiz_submissions").insert({
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email,
        company: result.data.company,
        product_count: answers.productCount,
        expected_volume: answers.expectedVolume,
        time_per_item: answers.timePerItem,
        revenue_range: answers.revenueRange,
        saved_hours: userMonthlyHours,
      });
      if (error) throw error;
      trackCustomEvent("LeadFormSubmit", { userMonthlyHours });
      // Fire notification email (non-blocking)
      supabase.functions.invoke("notify-submission", {
        body: {
          type: "quiz_submission",
          record: {
            name: result.data.name, email: result.data.email, phone: result.data.phone,
            company: result.data.company, product_count: answers.productCount,
            expected_volume: answers.expectedVolume, time_per_item: answers.timePerItem,
            revenue_range: answers.revenueRange, saved_hours: userMonthlyHours,
          },
        },
      }).catch(console.error);
      navigate("/thank-you");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = seoUrl.trim();
    const email = seoEmail.trim();
    if (!url || !email) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setSubmittingSeo(true);
    try {
      const { error } = await supabase.from("seo_text_requests").insert({ website_url: url, email });
      if (error) throw error;
      trackCustomEvent("SeoTextRequest", { url, email });
      // Fire notification email (non-blocking)
      supabase.functions.invoke("notify-submission", {
        body: { type: "seo_request", record: { website_url: url, email } },
      }).catch(console.error);
      navigate("/thank-you");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmittingSeo(false);
    }
  };

  const tooltipTerms = [
    { term: t("pillTekstTitle") as string, descKey: "pillTekstDesc" as const },
    { term: "Metadata", desc: "Titel-tags og meta-beskrivelser der optimerer din synlighed i søgeresultater." },
    { term: "FAQ", desc: "Strukturerede spørgsmål og svar der vises direkte i Google-søgeresultater." },
    { term: "Schema", desc: "Struktureret data-markup der hjælper søgemaskiner med at forstå dit indhold." },
    { term: "Interne links", desc: "Links mellem dine egne sider der styrker din sidestruktur og SEO." },
  ];

  const truncateWords = (text: string, count: number) => {
    const words = text.split(" ");
    if (words.length <= count) return { truncated: text, isTruncated: false };
    return { truncated: words.slice(0, count).join(" ") + "…", isTruncated: true };
  };

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const toggleCard = (key: string) => setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));

  const featureCards = [
    { icon: Link, titleKey: "featureCard1Title" as const, descKey: "featureCard1Desc" as const, color: "bg-primary/10 text-primary" },
    { icon: Zap, titleKey: "featureCard2Title" as const, descKey: null, color: "bg-accent/15 text-accent", hasPills: true },
    { icon: Cpu, titleKey: "featureCard3Title" as const, descKey: "featureCard3Desc" as const, color: "bg-primary/10 text-primary", truncatable: true },
    { icon: Trophy, titleKey: "featureCard4Title" as const, descKey: "featureCard4Desc" as const, color: "bg-accent/15 text-accent", truncatable: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto w-full px-4 space-y-6"
    >
      <AnimatePresence mode="wait">
        {/* ========== PAGE 1: PAIN ========== */}
        {page === "pain" && (
          <motion.div
            key="pain"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-sora text-2xl md:text-3xl font-extrabold text-primary text-center"
            >
              {t("resultsTitle") as string}
            </motion.h2>

            {/* Card 1: Monthly hours */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-accent/30 shadow-md">
                <CardContent className="pt-6 pb-6 flex items-start gap-4">
                  <div className="bg-primary/10 rounded-xl p-3 shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-foreground text-base leading-relaxed">
                    {t("painCard1Pre") as string}{" "}
                    <span className="text-2xl font-extrabold text-primary">{animatedMonthlyHours}</span>{" "}
                    {t("painCard1Post") as string}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Existing products */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="border-accent/30 shadow-md">
                <CardContent className="pt-6 pb-6 flex items-start gap-4">
                  <div className="bg-accent/15 rounded-xl p-3 shrink-0">
                    <Package className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-foreground text-base leading-relaxed">
                    {t("painCard2Pre") as string}{" "}
                    <span className="text-2xl font-extrabold text-primary">{animatedProductCount}</span>{" "}
                    {t("painCard2Mid") as string}{" "}
                    <span className="text-2xl font-extrabold text-primary">{animatedOptHours}</span>{" "}
                    {t("painCard2Post") as string}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Samurai pitch */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-muted-foreground text-sm"
            >
              {t("samuraiPitch") as string}
            </motion.p>

            {/* Plaza case section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="border-border/50 shadow-sm bg-secondary/30">
                <CardContent className="pt-6 pb-6 space-y-4">
                  <h3 className="font-sora text-base font-bold text-primary">
                    {t("plazaCaseHeading") as string}
                  </h3>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      {t("plazaStat1") as string}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      {t("plazaStat2") as string}
                    </li>
                  </ul>
                  <p className="text-sm font-semibold text-primary">
                    {t("plazaTrafficStat") as string}
                  </p>
                  <div className="bg-background/60 rounded-xl p-4 border border-border/30 flex gap-4 items-start">
                    <Avatar className="h-12 w-12 shrink-0 mt-1">
                      <AvatarImage src={askeImg} alt="Aske Frederiksen" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">AF</AvatarFallback>
                    </Avatar>
                    <div>
                      <Quote className="h-4 w-4 text-muted-foreground mb-2" />
                      <p className="text-sm italic text-muted-foreground leading-relaxed">
                        {t("plazaQuote") as string}
                      </p>
                      <p className="text-xs font-semibold text-primary mt-2">
                        {t("plazaQuoteAuthor") as string}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA to page 2 */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <Button
                onClick={() => setPage("solution")}
                className="w-full rounded-full py-6 text-base font-semibold gap-2 bg-primary text-primary-foreground"
              >
                {t("wantToKnowCta") as string}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ========== PAGE 2: SOLUTION ========== */}
        {page === "solution" && (
          <motion.div
            key="solution"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-sora text-2xl md:text-3xl font-extrabold text-primary text-center"
            >
              {t("solutionTitle") as string}
            </motion.h2>

            {/* Feature Cards */}
            <div className="grid gap-4">
              {featureCards.map((card, i) => {
                const descText = card.descKey ? (t(card.descKey) as string) : "";
                const isExpanded = expandedCards[card.titleKey] || false;
                const { truncated, isTruncated } = card.truncatable
                  ? truncateWords(descText, 12)
                  : { truncated: descText, isTruncated: false };

                return (
                  <motion.div
                    key={card.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.12 }}
                  >
                    <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="pt-5 pb-5 flex items-start gap-4">
                        <div className={`${card.color} rounded-xl p-3 shrink-0`}>
                          <card.icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-sora text-sm font-bold text-foreground mb-1">
                            {t(card.titleKey) as string}
                          </h3>
                          {card.descKey && (
                            <>
                              <AnimatePresence mode="wait" initial={false}>
                                <motion.p
                                  key={isExpanded ? "full" : "short"}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-sm text-muted-foreground leading-relaxed inline"
                                >
                                  {isTruncated && !isExpanded ? truncated : descText}
                                </motion.p>
                              </AnimatePresence>
                              {isTruncated && (
                                <button
                                  onClick={() => toggleCard(card.titleKey)}
                                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors ml-1"
                                >
                                  {isExpanded ? (t("readLess") as string) : (t("readMore") as string)}
                                </button>
                              )}
                            </>
                          )}
                          {(card as any).hasPills && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {tooltipTerms.map((tt) => (
                                <Popover key={tt.term}>
                                  <PopoverTrigger asChild>
                                    <button className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full cursor-pointer border border-primary/20 hover:bg-primary/20 transition-colors">
                                      {tt.term}
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent side="top" className="max-w-[260px] text-xs p-3">
                                    {"descKey" in tt ? (t(tt.descKey as any) as string) : (tt as any).desc}
                                  </PopoverContent>
                                </Popover>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust bar with award images */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4"
            >
              <img src={reaktionBadge} alt="Reaktion Case Competition Winner" className="w-full max-w-[200px] sm:max-w-[220px] object-contain" />
              <img src={searchAwardsBadge} alt="European Search Awards 2025 Finalist" className="w-full max-w-[200px] sm:max-w-[220px] object-contain" />
            </motion.div>

            {/* SEO Expert Quote */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center py-4"
            >
              <Quote className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="font-sora text-base md:text-lg font-bold text-primary italic leading-relaxed max-w-md mx-auto">
                {t("seoExpertQuote") as string}
              </p>
            </motion.div>

            {/* CTA buttons */}
            {ctaState === "idle" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <Button
                  onClick={() => setCTAState("form")}
                  className="w-full rounded-full py-6 text-base font-semibold gap-2 bg-primary text-primary-foreground"
                >
                  <FileText className="h-4 w-4" />
                  {t("fillFormCta") as string}
                </Button>
                <Button
                  onClick={() => setCTAState("meeting")}
                  variant="outline"
                  className="w-full rounded-full py-6 text-base font-semibold gap-2 border-primary/20 hover:bg-primary hover:text-primary-foreground"
                >
                  <CalendarDays className="h-4 w-4" />
                  {t("bookMeetingCta") as string}
                </Button>
                <button
                  onClick={() => setCTAState("declined")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                >
                  {t("notReadyCta") as string}
                </button>
              </motion.div>
            )}

            {/* Contact form */}
            <AnimatePresence>
              {ctaState === "form" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="border-border/50 shadow-md">
                    <CardContent className="pt-6 pb-8">
                      <h3 className="font-sora text-lg font-bold text-primary mb-1">{t("contactTitle") as string}</h3>
                      <p className="text-sm text-muted-foreground mb-5">{t("contactSubtitle") as string}</p>
                      <form onSubmit={handleContactSubmit} className="space-y-3">
                        <Input placeholder={t("contactName") as string} value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} className="rounded-xl" required maxLength={100} />
                        <Input placeholder={t("contactPhone") as string} value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} className="rounded-xl" required maxLength={30} />
                        <Input type="email" placeholder={t("contactEmail") as string} value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} className="rounded-xl" required maxLength={255} />
                        <Input placeholder={t("contactCompany") as string} value={contact.company} onChange={(e) => setContact((c) => ({ ...c, company: e.target.value }))} className="rounded-xl" required maxLength={200} />
                        <Button type="submit" disabled={submitting} className="w-full rounded-full py-6 text-base font-semibold gap-2 bg-primary text-primary-foreground">
                          <Send className="h-4 w-4" />
                          {t("contactSubmit") as string}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Specialist booking */}
            <AnimatePresence>
              {ctaState === "meeting" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {!selectedSpecialist && (
                    <Card className="border-border/50 shadow-md">
                      <CardContent className="pt-6 pb-6">
                        <h3 className="font-sora text-lg font-bold text-primary mb-4">{t("specialistHeading") as string}</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {specialists.map((spec) => (
                            <button
                              key={spec.key}
                              onClick={() => setSelectedSpecialist(spec.key)}
                              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                            >
                              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                                <AvatarImage src={spec.img} alt={t(spec.nameKey as any) as string} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{spec.initials}</AvatarFallback>
                              </Avatar>
                              <span className="font-sora text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {t(spec.nameKey as any) as string}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {t("specialistBook") as string}
                              </span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedSpecialist && (
                    <Card className="border-border/50 shadow-md">
                      <CardContent className="pt-6 pb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-sora text-lg font-bold text-primary">
                            {t("specialistBook") as string} {t(specialists.find(s => s.key === selectedSpecialist)?.nameKey as any) as string}
                          </h3>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSpecialist(null)} className="text-muted-foreground">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {activeHubspotUrl ? (
                          <iframe
                            src={activeHubspotUrl}
                            className="w-full min-h-[500px] rounded-xl border-0"
                            title="Book a meeting"
                          />
                        ) : (
                          <div className="w-full min-h-[300px] rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
                            {t("hubspotPlaceholder") as string}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Declined — downsell */}
            <AnimatePresence>
              {ctaState === "declined" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="pt-6 pb-6">
                      <h3 className="font-sora text-lg font-bold text-primary mb-1">{t("downsellTitle") as string}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t("downsellSubtitle") as string}</p>
                      <form onSubmit={handleSeoSubmit} className="space-y-3">
                        <Input
                          type="text"
                          placeholder={t("downsellUrlPlaceholder") as string}
                          value={seoUrl}
                          onChange={(e) => setSeoUrl(e.target.value)}
                          className="rounded-xl"
                          required
                        />
                        <Input
                          type="email"
                          placeholder={t("downsellEmailPlaceholder") as string}
                          value={seoEmail}
                          onChange={(e) => setSeoEmail(e.target.value)}
                          className="rounded-xl"
                          required
                          maxLength={255}
                        />
                        <Button type="submit" disabled={submittingSeo} className="w-full rounded-full py-5 gap-2 bg-primary text-primary-foreground">
                          <Globe className="h-4 w-4" />
                          {t("downsellSubmit") as string}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to CTAs */}
            {ctaState !== "idle" && (
              <button
                onClick={() => { setCTAState("idle"); setSelectedSpecialist(null); }}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-2 flex items-center justify-center gap-1"
              >
                <X className="h-3 w-3" />
                {t("back") as string}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultsSection;
