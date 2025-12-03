"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Quote, RefreshCw, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import SentenceCard from "./sentence-card";

type Quote = {
  q: string;
  a: string;
};

type Mode = "random" | "today" | "quotes";

const COOLDOWN_SECONDS = 30;

export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(
    new Set()
  );
  const [mode, setMode] = useState<Mode>("quotes");
  const [cooldown, setCooldown] = useState(0);
  const { toast } = useToast();

  const CACHE_KEY_SENTENCES_PREFIX = "sentenceExplorer_sentences";
  const CACHE_KEY_CLICKED_PREFIX = "sentenceExplorer_clicked";
  const CACHE_KEY_MODE = "sentenceExplorer_mode";

  const getCacheKeys = (mode: Mode) => ({
    sentencesKey: `${CACHE_KEY_SENTENCES_PREFIX}_${mode}`,
    clickedKey: `${CACHE_KEY_CLICKED_PREFIX}_${mode}`,
  });

  const loadSentences = useCallback(
    async (currentMode: Mode, forceRefresh = false) => {
      const { sentencesKey, clickedKey } = getCacheKeys(currentMode);
      if (!forceRefresh || cooldown > 0) {
        try {
          const cachedSentences = localStorage.getItem(sentencesKey);

          if (cachedSentences) {
            const parsedSentenceCached = JSON.parse(cachedSentences);
            setSentences(parsedSentenceCached);
            const cachedClicked = localStorage.getItem(clickedKey);
            if (cachedClicked) {
              setClickedSentences(new Set(JSON.parse(cachedClicked)));
            }
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.warn(
            "Could not check navigation type, proceeding with fetch."
          );
        }
      }

      try {
        const response = await fetch(`/api/quotes?mode=${currentMode}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch sentences from API.");
        }

        const newSentences = Array.isArray(data) ? data : [data];
        setSentences(newSentences);
        localStorage.setItem(sentencesKey, JSON.stringify(newSentences));
        localStorage.setItem(CACHE_KEY_MODE, currentMode);

        setCooldown(COOLDOWN_SECONDS);
      } catch (error) {
        console.error("Error loading sentences:", error);
        toast({
          variant: "destructive",
          title: "Could not fetch sentences.",
          description:
            error instanceof Error
              ? error.message
              : "Please check your network connection and try again.",
        });
        setSentences([]);
      } finally {
        setIsLoading(false);
      }
    },
    [toast, cooldown]
  );

  useEffect(() => {
    try {
      const cachedMode = localStorage.getItem(CACHE_KEY_MODE) as Mode | null;
      const currentMode = cachedMode || "quotes";
      setMode(currentMode);

      const { clickedKey } = getCacheKeys(mode);
      const cachedClicked = localStorage.getItem(clickedKey);
      if (cachedClicked) {
        setClickedSentences(new Set(JSON.parse(cachedClicked)));
      } else {
        localStorage.removeItem(clickedKey);
      }

      loadSentences(currentMode);
    } catch (e) {
      // Fallback for environments where performance API might not be available
      loadSentences("quotes");
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleSentenceClick = (sentence: string) => {
    const newClicked = new Set(clickedSentences).add(sentence);
    setClickedSentences(newClicked);

    const { clickedKey } = getCacheKeys(mode);
    localStorage.setItem(clickedKey, JSON.stringify(Array.from(newClicked)));
  };

  const handleRegenerate = () => {
    if (isLoading || cooldown > 0) return;

    setClickedSentences(new Set());
    const { sentencesKey, clickedKey } = getCacheKeys(mode);
    localStorage.removeItem(clickedKey);
    localStorage.removeItem(sentencesKey);

    loadSentences(mode, true);
  };

  const handleModeChange = (newMode: string) => {
    setClickedSentences(new Set());
    setMode(newMode as Mode);
    loadSentences(newMode as Mode, false);

    localStorage.setItem(CACHE_KEY_MODE, newMode as Mode);
  };

  const title = useMemo(() => {
    switch (mode) {
      case "random":
        return "Random Quote";
      case "today":
        return "Quote of the Day";
      case "quotes":
        return "Inspiring Quotes";
    }
  }, [mode]);

  const isRegenerateDisabled = isLoading || cooldown > 0;

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
          Discover profound and inspiring quotes. Select a mode below to start
          exploring.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
        <Tabs
          value={mode}
          onValueChange={handleModeChange}
          className="shrink-0"
        >
          <TabsList className="bg-card/50 border">
            <TabsTrigger value="quotes">List</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="random">Random</TabsTrigger>
          </TabsList>
        </Tabs>
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: mode === "quotes" ? 12 : 1 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-card/20"></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sentences.map((quote) => (
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
