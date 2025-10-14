'use client';

import { useState, useTransition, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { regenerateSentencesAction } from '@/app/actions';
import SentenceCard from './sentence-card';
import { Skeleton } from '@/components/ui/skeleton';

const FALLBACK_SENTENCES = [
    "To be happy is to be able to become aware of oneself without fright.",
    "The higher we are placed, the more humbly we should walk.",
    "Government of the people, by the people, for the people, shall not perish from the Earth.",
    "By accepting yourself and being fully what you are, your presence can make others happy.",
    "A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing."
];


export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSentences = () => {
    startTransition(async () => {
      if (!isLoading) setIsLoading(true);
      const newSentences = await regenerateSentencesAction();
      if (newSentences && newSentences.length > 0) {
        setSentences(newSentences);
      } else {
        setSentences(FALLBACK_SENTENCES);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch sentences. Displaying fallback sentences.',
        });
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchSentences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = () => {
    fetchSentences();
  };

  const handleSentenceClick = (sentence: string) => {
    setClickedSentences((prev) => new Set(prev).add(sentence));
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-center sm:text-left">
          Sentence Explorer
        </h1>
        <Button
          onClick={handleRegenerate}
          disabled={isPending || isLoading}
          size="lg"
        >
          <RefreshCw className={isPending || isLoading ? 'animate-spin' : ''} />
          <span>{isPending || isLoading ? 'Generating...' : 'Regenerate Sentences'}</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading || isPending
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))
          : sentences.map((sentence) => (
              <div key={sentence} className="animate-in fade-in-50 duration-500">
                <SentenceCard
                  sentence={sentence}
                  isClicked={clickedSentences.has(sentence)}
                  onClick={() => handleSentenceClick(sentence)}
                />
              </div>
            ))}
      </div>
    </div>
  );
}
