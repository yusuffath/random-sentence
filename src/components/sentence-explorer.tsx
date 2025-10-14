'use client';

import { useState, useTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { regenerateSentencesAction } from '@/app/actions';
import SentenceCard from './sentence-card';
import { Skeleton } from '@/components/ui/skeleton';

interface SentenceExplorerProps {
  initialSentences: string[];
}

export default function SentenceExplorer({ initialSentences }: SentenceExplorerProps) {
  const [sentences, setSentences] = useState<string[]>(initialSentences);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRegenerate = () => {
    startTransition(async () => {
      try {
        const newSentences = await regenerateSentencesAction();
        if (newSentences && newSentences.length > 0) {
          setSentences(newSentences);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not generate new sentences. Check your API key and try again.',
          });
        }
      } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not generate new sentences. Check your API key and try again.',
          });
      }
    });
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
        <Button onClick={handleRegenerate} disabled={isPending} size="lg">
          <RefreshCw className={isPending ? 'animate-spin' : ''} />
          <span>{isPending ? 'Generating...' : 'Regenerate Sentences'}</span>
        </Button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isPending
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
