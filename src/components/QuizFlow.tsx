import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import ResultsSection from "./ResultsSection";
import { trackCustomEvent } from "@/lib/facebook-pixel";

const TOTAL_STEPS = 5;

interface QuizAnswers {
  usesShopify: boolean | null;
  productCount: number;
  expectedVolume: number;
  timePerItem: number;
  revenueRange: string;
}

const QuizFlow = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    usesShopify: null,
    productCount: 100,
    expectedVolume: 50,
    timePerItem: 30,
    revenueRange: "",
  });

  const startQuiz = () => {
    setStep(1);
    trackCustomEvent("QuizStart");
  };

  const nextStep = () => {
    if (step === TOTAL_STEPS) {
      trackCustomEvent("QuizComplete", { answers });
      setStep(6);
    } else {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const progressPercent = step === 0 ? 0 : step > TOTAL_STEPS ? 100 : (step / TOTAL_STEPS) * 100;

  const revenueOptions = t("q5Options") as string[];

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  // Hero
  if (step === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto py-16 px-4"
      >
        <h1 className="font-sora text-4xl md:text-5xl font-extrabold text-primary leading-tight mb-6">
          {t("heroTitle") as string}
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          {t("heroSubtitle") as string}
        </p>
        <Button
          size="lg"
          onClick={startQuiz}
          className="rounded-full px-10 py-6 text-lg font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
        >
          {t("heroCta") as string}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>
    );
  }

  // Results
  if (step === 6) {
    return <ResultsSection answers={answers} />;
  }

  return (
    <div className="max-w-xl mx-auto w-full px-4">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{t("progressLabel") as string} {step} {t("of") as string} {TOTAL_STEPS}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <Card className="border-border/50 shadow-md">
            <CardContent className="pt-8 pb-8 px-6 md:px-8">
              {/* Step 1: Shopify? */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="font-sora text-xl font-bold text-primary">{t("q1Title") as string}</h2>
                  <div className="flex gap-3">
                    <Button
                      variant={answers.usesShopify === true ? "default" : "outline"}
                      className="flex-1 rounded-xl py-6"
                      onClick={() => setAnswers((a) => ({ ...a, usesShopify: true }))}
                    >
                      {t("q1Yes") as string}
                    </Button>
                    <Button
                      variant={answers.usesShopify === false ? "default" : "outline"}
                      className="flex-1 rounded-xl py-6"
                      onClick={() => setAnswers((a) => ({ ...a, usesShopify: false }))}
                    >
                      {t("q1No") as string}
                    </Button>
                  </div>
                  {answers.usesShopify === false && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground"
                    >
                      {t("q1NoMessage") as string}{" "}
                      <a
                        href="https://plutonic.dk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent font-semibold inline-flex items-center gap-1 hover:underline"
                      >
                        {t("q1NoLink") as string}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 2: Product count */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="font-sora text-xl font-bold text-primary">{t("q2Title") as string}</h2>
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        max={10000}
                        value={answers.productCount}
                        onChange={(e) => {
                          const v = Math.min(10000, Math.max(1, parseInt(e.target.value) || 1));
                          setAnswers((a) => ({ ...a, productCount: v }));
                        }}
                        className="w-28 text-center text-2xl font-bold rounded-xl"
                      />
                      <span className="text-muted-foreground">{t("q2Label") as string}</span>
                    </div>
                    <Slider
                      value={[answers.productCount]}
                      onValueChange={([v]) => setAnswers((a) => ({ ...a, productCount: v }))}
                      min={1}
                      max={10000}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Expected volume per month */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="font-sora text-xl font-bold text-primary">{t("q3Title") as string}</h2>
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Input
                        type="number"
                        min={0}
                        max={1000}
                        value={answers.expectedVolume}
                        onChange={(e) => {
                          const v = Math.min(1000, Math.max(0, parseInt(e.target.value) || 0));
                          setAnswers((a) => ({ ...a, expectedVolume: v }));
                        }}
                        className="w-28 text-center text-2xl font-bold rounded-xl"
                      />
                      <span className="text-muted-foreground">{t("q3Label") as string}</span>
                    </div>
                    <Slider
                      value={[answers.expectedVolume]}
                      onValueChange={([v]) => setAnswers((a) => ({ ...a, expectedVolume: v }))}
                      min={0}
                      max={1000}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Time per item */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="font-sora text-xl font-bold text-primary">{t("q4Title") as string}</h2>
                  <div className="pt-4">
                    <Slider
                      value={[answers.timePerItem]}
                      onValueChange={([v]) => setAnswers((a) => ({ ...a, timePerItem: v }))}
                      min={1}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center mt-4">
                      <span className="text-3xl font-bold text-primary">{answers.timePerItem}</span>
                      <span className="text-muted-foreground ml-2">{t("q4Label") as string}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Revenue range */}
              {step === 5 && (
                <div className="space-y-4">
                  <h2 className="font-sora text-xl font-bold text-primary">{t("q5Title") as string}</h2>
                  <div className="space-y-2">
                    {revenueOptions.map((option) => (
                      <Button
                        key={option}
                        variant={answers.revenueRange === option ? "default" : "outline"}
                        className="w-full justify-start rounded-xl py-5"
                        onClick={() => setAnswers((a) => ({ ...a, revenueRange: option }))}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={step <= 1}
          className="gap-2 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back") as string}
        </Button>
        <Button
          onClick={nextStep}
          disabled={step === 1 && answers.usesShopify !== true}
          className="gap-2 rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {step === TOTAL_STEPS ? (t("seeResults") as string) : (t("next") as string)}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuizFlow;
