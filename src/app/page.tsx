import SentenceExplorer from '@/components/sentence-explorer';

const INITIAL_SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'To be or not to be, that is the question.',
  'I have a dream that one day this nation will rise up.',
  'The only thing we have to fear is fear itself.',
  'Ask not what your country can do for you; ask what you can do for your country.',
  'Two roads diverged in a wood, and I—I took the one less traveled by.',
  'That which does not kill us makes us stronger.',
  'The journey of a thousand miles begins with a single step.',
];

export default async function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SentenceExplorer initialSentences={INITIAL_SENTENCES} />
    </main>
  );
}
