import Header from "@/components/Header";
import QuizFlow from "@/components/QuizFlow";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl mx-auto py-8 px-4">
        <QuizFlow />
      </main>
    </div>
  );
};

export default Index;
