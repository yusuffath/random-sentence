'use client';

import {useState, useEffect, useCallback, useMemo} from 'react';
import SentenceCard from './sentence-card';
import {Button} from '@/components/ui/button';
import {RefreshCw, Quote} from 'lucide-react';
import {Card} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';

type Quote = {
  q: string;
  a: string;
};

type Mode = 'random' | 'today' | 'quotes';

export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(
    new Set()
  );
  const [mode, setMode] = useState<Mode>('random');
  const {toast} = useToast();

  const loadSentences = useCallback(
    async (currentMode: Mode) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/quotes?mode=${currentMode}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch sentences from API.');
        }
        
        // The API returns an array for all modes, even if it's a single quote.
        setSentences(data);
      } catch (error) {
        console.error('Error loading sentences:', error);
        toast({
          variant: 'destructive',
          title: 'Could not fetch sentences.',
          description: error instanceof Error ? error.message : 'Please check your network connection and try again.',
        });
        setSentences([]);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadSentences(mode);
  }, [loadSentences, mode]);

  const handleSentenceClick = (sentence: string) => {
    setClickedSentences(prev => new Set(prev).add(sentence));
  };

  const handleRegenerate = () => {
    setClickedSentences(new Set());
    if (mode === 'random') {
      loadSentences(mode);
    }
  };

  const handleModeChange = (newMode: string) => {
    setClickedSentences(new Set());
    setMode(newMode as Mode);
  };
  
  const title = useMemo(() => {
    switch (mode) {
      case 'random':
        return 'Random Quote';
      case 'today':
        return "Quote of the Day";
      case 'quotes':
        return 'Inspiring Quotes';
    }
  }, [mode]);


  return (
    <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <Quote className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Sentence Explorer
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">
            {title}
          </p>
        </div>
        <Button
          onClick={handleRegenerate}
          size="lg"
          disabled={isLoading || mode !== 'random'}
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Loading...' : 'New Quote'}</span>
        </Button>
      </header>

      <div className="mb-8 flex justify-center">
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList>
            <TabsTrigger value="random">Random</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="quotes">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({length: mode === 'quotes' ? 12 : 1}).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted/50"></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sentences.map(quote => (
            <div
              key={quote.q}
              className="animate-in fade-in-50 duration-500"
            >
              <SentenceCard
                sentence={quote.q}
                author={quote.a}
                isClicked={clickedSentences.has(quote.q)}
                onClick={() => handleSentenceClick(quote.q)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
