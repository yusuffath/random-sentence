import SentenceExplorer from '@/components/sentence-explorer';

async function getSentences() {
  try {
    const response = await fetch('https://api.quotable.io/quotes/random?limit=5', {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.map((quote: any) => quote.content);
  } catch (error) {
    console.error('Error fetching sentences:', error);
    // Return null to indicate failure
    return null;
  }
}

const FALLBACK_SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'To be or not to be, that is the question.',
  'I have a dream that one day this nation will rise up.',
  'The only thing we have to fear is fear itself.',
  'Ask not what your country can do for you; ask what you can do for your country.',
];

export default async function Home() {
  const sentences = await getSentences();

  return (
    <main className="min-h-screen bg-background">
      <SentenceExplorer
        initialSentences={sentences ?? FALLBACK_SENTENCES}
        showFallbackError={!sentences}
      />
    </main>
  );
}
