import SentenceExplorer from '@/components/sentence-explorer';

const INITIAL_SENTENCES = [
    "To be happy is to be able to become aware of oneself without fright.",
    "The higher we are placed, the more humbly we should walk.",
    "Government of the people, by the people, for the people, shall not perish from the Earth.",
    "By accepting yourself and being fully what you are, your presence can make others happy.",
    "A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing.",
];


export default async function Home() {

  return (
    <main className="min-h-screen bg-background">
      <SentenceExplorer initialSentences={INITIAL_SENTENCES} />
    </main>
  );
}