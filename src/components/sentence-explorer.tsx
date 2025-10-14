'use client';

import { useState, useEffect } from 'react';
import SentenceCard from './sentence-card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card } from '@/components/ui/card';

const FALLBACK_SENTENCES = [
  'To be happy is to be able to become aware of oneself without fright.',
  'The higher we are placed, the more humbly we should walk.',
  'Government of the people, by the people, for the people, shall not perish from the Earth.',
  'By accepting yourself and being fully what you are, your presence can make others happy.',
  'A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing.',
];

async function getSentencesFromApi(): Promise<string[]> {
  const response = await fetch('https://api.quotable.io/quotes/random?limit=5');
  if (!response.ok) {
    throw new Error('Could not fetch sentences.');
  }
  const data = await response.json();
  return data.map((quote: { content: string }) => quote.content);
}


export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchSentences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSentences = await getSentencesFromApi();
      setSentences(newSentences);
    } catch (e) {
      setError('Could not fetch sentences. Displaying fallback sentences.');
      setSentences(FALLBACK_SENTENCES);
      toast({
        variant: "destructive",
        title: "API Error",
        description: "Could not fetch new sentences from the API. Using fallback sentences.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSentences();
  }, [toast]);

  const handleSentenceClick = (sentence: string) => {
    setClickedSentences((prev) => new Set(prev).add(sentence));
  };

  const handleRegenerate = () => {
    fetchSentences();
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-center sm:text-left">
          Sentence Explorer
        </h1>
        <Button onClick={handleRegenerate} variant="outline" className="shrink-0" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Regenerate'}
        </Button>
      </header>

      {error && (
        <div className="mb-8 flex items-center justify-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-300">
           <AlertTriangle className="h-5 w-5" />
           <p>{error}</p>
        </div>
      )}

      {isLoading && sentences.length === 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 5 }).map((_, i) => (
             <Card key={i} className="h-24 animate-pulse bg-muted/50"></Card>
           ))}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sentences.map((sentence) => (
            <div key={sentence} className="animate-in fade-in-50 duration-500">
              <SentenceCard
                sentence={sentence}
                isClicked={clickedSentences.has(sentence)}
                onClick={() => handleSentenceClick(sentence)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
