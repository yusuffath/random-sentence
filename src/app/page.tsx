import SentenceExplorer from '@/components/sentence-explorer';
import { createClient } from '@vercel/edge-config';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let cfg = {};
  try {
    if (process.env.EDGE_CONFIG) {
      // Vercel sometimes provides a custom edge-config:// URI scheme. We replace it to standard https.
      let connectionString = process.env.EDGE_CONFIG;
      if (connectionString.startsWith('edge-config://')) {
        connectionString = connectionString.replace('edge-config://', 'https://edge-config.vercel.com/');
      }
      const edgeConfigClient = createClient(connectionString);
      cfg = (await edgeConfigClient.getAll()) ?? {};
    } else {
      console.warn("EDGE_CONFIG environment variable is not defined.");
    }
  } catch (error) {
    console.error("Error fetching edge config:", error);
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-slate-900/50 to-background"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>
      <div className="relative z-10">
        <SentenceExplorer cfg={cfg} />
      </div>
    </main>
  );
}
