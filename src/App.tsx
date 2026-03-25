import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { initFacebookPixel } from "@/lib/facebook-pixel";

const queryClient = new QueryClient();

function PixelLoader() {
  useEffect(() => {
    const loadPixel = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("facebook_pixel_id")
        .limit(1)
        .single();
      if (data?.facebook_pixel_id) {
        initFacebookPixel(data.facebook_pixel_id);
      }
    };
    loadPixel();
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <PixelLoader />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
