'use client';

import { useState, useEffect } from 'react';
import SentenceCard from './sentence-card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card } from '@/components/ui/card';

async function getSentencesFromApi(): Promise<string[]> {
  const response = await fetch('https://zenquotes.io/api/quotes');
  if (!response.ok) {
    throw new Error('Could not fetch sentences.');
  }
  const data = await response.json();
  // The API returns 50 quotes, let's shuffle and take 5
  const shuffled = data.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map((quote: { q: string }) => quote.q);
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
      setError('Could not fetch sentences. Please check your network connection.');
      setSentences([]);
      toast({
        variant: "destructive",
        title: "API Error",
        description: "Could not fetch new sentences from the API. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSentences();
  }, []);

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
