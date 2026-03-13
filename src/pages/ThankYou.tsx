import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/facebook-pixel";
import Header from "@/components/Header";

const ThankYou = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent("Lead");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-xl mx-auto py-20 px-4">
        <Card className="border-border/50 shadow-lg text-center">
          <CardContent className="pt-12 pb-12 space-y-6">
            <CheckCircle className="h-16 w-16 mx-auto text-accent" />
            <h1 className="font-sora text-3xl font-bold text-primary">
              {t("thankYouTitle") as string}
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {t("thankYouMessage") as string}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("thankYouBack") as string}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ThankYou;
