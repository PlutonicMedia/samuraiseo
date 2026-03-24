import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { trackCustomEvent } from "@/lib/facebook-pixel";
import { toast } from "sonner";
import { Clock, Package, ArrowRight, Send, CalendarDays, FileText, X, Globe, Quote } from "lucide-react";
import { z } from "zod";

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

// Animated counter hook
function useAnimatedCounter(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
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
  const [hubspotUrl, setHubspotUrl] = useState<string | null>(null);

  // Calculations
  const userMonthlyHours = Math.round((answers.expectedVolume * answers.timePerItem) / 60);
  const userTotalOptimizationHours = Math.round((answers.productCount * answers.timePerItem) / 60);

  const animatedMonthlyHours = useAnimatedCounter(userMonthlyHours);
  const animatedProductCount = useAnimatedCounter(answers.productCount);
  const animatedOptHours = useAnimatedCounter(userTotalOptimizationHours);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("hubspot_calendar_url")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.hubspot_calendar_url) setHubspotUrl(data.hubspot_calendar_url);
      });
  }, []);

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
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    setSubmittingSeo(true);
    try {
      const { error } = await supabase.from("seo_text_requests").insert({
        website_url: url,
        email,
      });
      if (error) throw error;
      trackCustomEvent("SeoTextRequest", { url, email });
      navigate("/thank-you");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmittingSeo(false);
    }
  };

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
            {/* Heading */}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
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
                  <div className="bg-background/60 rounded-xl p-4 border border-border/30">
                    <Quote className="h-4 w-4 text-muted-foreground mb-2" />
                    <p className="text-sm italic text-muted-foreground leading-relaxed">
                      {t("plazaQuote") as string}
                    </p>
                    <p className="text-xs font-semibold text-primary mt-2">
                      {t("plazaQuoteAuthor") as string}
                    </p>
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

            <Card className="border-border/50 shadow-md">
              <CardContent className="pt-6 pb-6 space-y-4">
                <ul className="space-y-3 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {t("solutionPoint1") as string}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {t("solutionPoint2") as string}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {t("solutionPoint3") as string}
                  </li>
                </ul>
              </CardContent>
            </Card>

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

            {/* Meeting */}
            <AnimatePresence>
              {ctaState === "meeting" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card className="border-border/50 shadow-md">
                    <CardContent className="pt-6 pb-8">
                      <h3 className="font-sora text-lg font-bold text-primary mb-4">{t("bookMeetingCta") as string}</h3>
                      {hubspotUrl ? (
                        <iframe
                          src={hubspotUrl}
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
                onClick={() => setCTAState("idle")}
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
