'use client';

import { useState, useEffect, useCallback } from 'react';
import SentenceCard from './sentence-card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadSentences = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/quotes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sentences from API.');
      }
      const data = await response.json();
      
      // ZenQuotes API returns [{q: "quote", a: "author"}, ...]
      const newSentences = data.map((quote: { q: string }) => quote.q).slice(0, 5);
      setSentences(newSentences);
    } catch (error) {
      console.error('Error loading sentences:', error);
      toast({
        variant: "destructive",
        title: "Could not fetch sentences.",
        description: "Please check your network connection and try again.",
      });
      setSentences([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSentences();
  }, [loadSentences]);

  const handleSentenceClick = (sentence: string) => {
    setClickedSentences((prev) => new Set(prev).add(sentence));
  };

  const handleRegenerate = () => {
    setClickedSentences(new Set());
    loadSentences();
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Sentence Explorer
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Discover and explore new ideas.</p>
        </div>
        <Button onClick={handleRegenerate} size="lg" disabled={isLoading}>
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Loading...' : 'Regenerate'}</span>
        </Button>
      </header>

      {isLoading && sentences.length === 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {Array.from({ length: 5 }).map((_, i) => (
             <Card key={i} className="h-32 animate-pulse bg-muted/50"></Card>
           ))}
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
