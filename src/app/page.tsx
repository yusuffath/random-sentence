import SentenceExplorer from '@/components/sentence-explorer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-slate-900/50 to-background"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>
      <div className="relative z-10">
        <SentenceExplorer />
      </div>
    </main>
  );
}
