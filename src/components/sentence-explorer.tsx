'use client';

import {useState, useEffect, useCallback, useMemo} from 'react';
import SentenceCard from './sentence-card';
import {Button} from '@/components/ui/button';
import {RefreshCw, Quote, Timer} from 'lucide-react';
import {Card} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';

type Quote = {
  q: string;
  a: string;
};

type Mode = 'random' | 'today' | 'quotes';

const COOLDOWN_SECONDS = 30;

export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(
    new Set()
  );
  const [mode, setMode] = useState<Mode>('quotes');
  const [cooldown, setCooldown] = useState(0);
  const {toast} = useToast();

  const loadSentences = useCallback(
    async (currentMode: Mode) => {
      if (currentMode === 'random' && cooldown > 0) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/quotes?mode=${currentMode}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch sentences from API.');
        }

        setSentences(Array.isArray(data) ? data : [data]);

        if (currentMode === 'random') {
          setCooldown(COOLDOWN_SECONDS);
        }

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
    [toast, cooldown]
  );

  useEffect(() => {
    loadSentences(mode);
  }, [mode]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleSentenceClick = (sentence: string) => {
    setClickedSentences(prev => new Set(prev).add(sentence));
  };

  const handleRegenerate = () => {
    if (mode === 'random' && cooldown === 0) {
      setClickedSentences(new Set());
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
        return 'Quote of the Day';
      case 'quotes':
        return 'Inspiring Quotes';
    }
  }, [mode]);

  const isRegenerateDisabled = isLoading || (mode === 'random' && cooldown > 0);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <header className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Quote className="h-12 w-12 text-primary/80" />
          <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tight">
            Sentence Explorer
          </h1>
        </div>
        <p className="text-muted-foreground text-xl max-w-2xl">
          Discover profound and inspiring quotes. Select a mode below to start exploring.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
        <Tabs value={mode} onValueChange={handleModeChange} className="shrink-0">
          <TabsList className="bg-card/50 border">
            <TabsTrigger value="quotes">List</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="random">Random</TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === 'random' && (
          <Button
            onClick={handleRegenerate}
            size="lg"
            variant="secondary"
            disabled={isRegenerateDisabled}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Timer className="h-5 w-5" />
                <span>{`Wait ${cooldown}s`}</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                <span>New Quote</span>
              </>
            )}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({length: mode === 'quotes' ? 12 : 1}).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-card/20"></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sentences.map(quote => (
            <div
              key={quote.q}
              className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500 ease-out"
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
