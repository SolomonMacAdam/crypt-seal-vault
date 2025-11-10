import Header from "@/components/Header";
import Hero from "@/components/Hero";
import RatingSystem from "@/components/RatingSystem";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <RatingSystem />
      </main>
    </div>
  );
};

export default Index;
