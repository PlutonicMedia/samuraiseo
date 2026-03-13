import Header from "@/components/Header";
import QuizFlow from "@/components/QuizFlow";
import TrustSidebar from "@/components/TrustSidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main quiz area */}
          <div className="flex-1 min-w-0">
            <QuizFlow />
          </div>
          {/* Trust sidebar — hidden on mobile until scroll */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24">
              <TrustSidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
