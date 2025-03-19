import ExploreSection from '@/components/ExploreSection';

export default function ExplorePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Explore Developer News</h1>
        <ExploreSection />
      </div>
    </main>
  );
} 