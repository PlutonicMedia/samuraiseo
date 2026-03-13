import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { trackCustomEvent } from "@/lib/facebook-pixel";
import { toast } from "sonner";
import { Clock, Zap, Send, Globe, Share2, CalendarDays, FileText, X } from "lucide-react";
import { z } from "zod";

interface ResultsSectionProps {
  answers: {
    productCount: number;
    expectedVolume: number;
    timePerItem: number;
    revenueRange: string;
    hasSeoControl: boolean;
  };
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(30),
  email: z.string().trim().email().max(255),
  company: z.string().trim().min(1).max(200),
});

type CTAState = "idle" | "form" | "meeting" | "declined";

const ResultsSection = ({ answers }: ResultsSectionProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [ctaState, setCTAState] = useState<CTAState>("idle");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", company: "" });
  const [seoUrl, setSeoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittingSeo, setSubmittingSeo] = useState(false);
  const [hubspotUrl, setHubspotUrl] = useState<string | null>(null);

  // Monthly volume * 12 for yearly
  const yearlyVolume = answers.expectedVolume * 12;
  const manualMinutes = yearlyVolume * answers.timePerItem;
  const samuraiMinutes = yearlyVolume * 1;
  const savedMinutes = manualMinutes - samuraiMinutes;
  const savedHours = Math.round(savedMinutes / 60);
  const manualHours = Math.round(manualMinutes / 60);
  const samuraiHours = Math.round(samuraiMinutes / 60);

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

  const handleShare = async () => {
    const text = `${t("resultsSaved") as string} ${savedHours} ${t("resultsHoursYear") as string} ${t("resultsDesc") as string}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Samurai SEO", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

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
        has_seo_control: answers.hasSeoControl,
        saved_hours: savedHours,
      });
      if (error) throw error;
      trackCustomEvent("LeadFormSubmit", { savedHours });
      navigate("/thank-you");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoUrl.trim()) return;
    setSubmittingSeo(true);
    try {
      const { error } = await supabase.from("seo_text_requests").insert({
        website_url: seoUrl.trim(),
      });
      if (error) throw error;
      trackCustomEvent("SeoTextRequest", { url: seoUrl });
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
      {/* Results card */}
      <Card className="border-accent/30 shadow-lg overflow-hidden">
        <div className="bg-primary p-6 text-primary-foreground text-center">
          <h2 className="font-sora text-2xl font-bold mb-1">{t("resultsTitle") as string}</h2>
        </div>
        <CardContent className="pt-6 pb-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mb-1">{t("resultsManual") as string}</p>
              <p className="text-2xl font-bold text-primary">{manualHours}h</p>
            </div>
            <div className="bg-accent/15 rounded-xl p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-xs text-muted-foreground mb-1">{t("resultsSamurai") as string}</p>
              <p className="text-2xl font-bold text-accent">{samuraiHours}h</p>
            </div>
          </div>
          <div className="text-center bg-primary/5 rounded-xl p-6">
            <p className="text-sm text-muted-foreground">{t("resultsSaved") as string}</p>
            <p className="text-5xl font-extrabold text-primary font-sora my-2">{savedHours}</p>
            <p className="text-sm text-muted-foreground">{t("resultsHoursYear") as string}</p>
            <p className="text-xs text-muted-foreground mt-2">{t("resultsDesc") as string}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full rounded-full gap-2 border-primary/20"
          >
            <Share2 className="h-4 w-4" />
            {t("shareResult") as string}
          </Button>
        </CardContent>
      </Card>

      {/* CTA buttons — always visible when idle */}
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

      {/* Meeting placeholder */}
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

      {/* Declined — secondary SEO CTA */}
      <AnimatePresence>
        {ctaState === "declined" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-sora text-lg font-bold text-primary mb-1">{t("secondaryTitle") as string}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("secondarySubtitle") as string}</p>
                <form onSubmit={handleSeoSubmit} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder={t("secondaryPlaceholder") as string}
                    value={seoUrl}
                    onChange={(e) => setSeoUrl(e.target.value)}
                    className="rounded-xl flex-1"
                    required
                  />
                  <Button type="submit" disabled={submittingSeo} variant="outline" className="rounded-full gap-2 border-primary/20 hover:bg-primary hover:text-primary-foreground">
                    <Globe className="h-4 w-4" />
                    {t("secondarySubmit") as string}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to CTAs link if not idle */}
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
  );
};

export default ResultsSection;
