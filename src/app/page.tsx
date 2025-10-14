import { generateNewSentences } from '@/ai/flows/generate-new-sentences';
import SentenceExplorer from '@/components/sentence-explorer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

async function getSentences() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return {
      sentences: [
        'The quick brown fox jumps over the lazy dog.',
        'To be or not to be, that is the question.',
        'I have a dream that one day this nation will rise up.',
        'The only thing we have to fear is fear itself.',
        'Ask not what your country can do for you; ask what you can do for your country.',
      ],
      apiKeyMissing: true,
    };
  }

  try {
    const initialData = await generateNewSentences({});
    return {
      sentences: initialData.sentences || [],
      apiKeyMissing: false,
    };
  } catch (error) {
    console.error('Error generating sentences, returning fallback.', error);
    return {
      sentences: [
        'The quick brown fox jumps over the lazy dog.',
        'To be or not to be, that is the question.',
        'I have a dream that one day this nation will rise up.',
        'The only thing we have to fear is fear itself.',
        'Ask not what your country can do for you; ask what you can do for your country.',
      ],
      apiKeyMissing: true, // Treat as if API key is missing to show the alert
    };
  }
}

export default async function Home() {
  const { sentences, apiKeyMissing } = await getSentences();

  return (
    <main className="min-h-screen bg-background">
      <SentenceExplorer initialSentences={sentences} />
      {apiKeyMissing && (
        <div className="container mx-auto px-4 mt-8 max-w-2xl">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>API Key Needed</AlertTitle>
            <AlertDescription>
              To generate new sentences, please add your Gemini API key to the{' '}
              <code className="font-mono text-sm font-semibold">.env</code> file.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </main>
  );
}
