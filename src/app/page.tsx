import SentenceExplorer from '@/components/sentence-explorer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--primary),0.1),rgba(255,255,255,0))]"></div>
      <SentenceExplorer />
    </main>
  );
}
