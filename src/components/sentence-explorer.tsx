"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Quote, RefreshCw, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import SentenceCard from "./sentence-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Quote = {
  q: string;
  a: string;
};

type Mode = "random" | "today" | "quotes";

const COOLDOWN_SECONDS = 30;
const AUTO_OPEN_DELAY = 10000; // 10 seconds

export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(
    new Set()
  );
  const [mode, setMode] = useState<Mode>("quotes");
  const [cooldown, setCooldown] = useState(0);
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const autoOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const CACHE_KEY_SENTENCES_PREFIX = "sentenceExplorer_sentences";
  const CACHE_KEY_CLICKED_PREFIX = "sentenceExplorer_clicked";
  const CACHE_KEY_MODE = "sentenceExplorer_mode";
  const CACHE_KEY_AUTO_OPEN = "sentenceExplorer_autoOpen";

  const getCacheKeys = (mode: Mode) => ({
    sentencesKey: `${CACHE_KEY_SENTENCES_PREFIX}_${mode}`,
    clickedKey: `${CACHE_KEY_CLICKED_PREFIX}_${mode}`,
  });

  const loadSentences = useCallback(
    async (currentMode: Mode, forceRefresh = false) => {
      setIsLoading(true);
      const { sentencesKey } = getCacheKeys(currentMode);

      if (!forceRefresh) {
        try {
          const cachedSentences = localStorage.getItem(sentencesKey);
          if (cachedSentences) {
            setSentences(JSON.parse(cachedSentences));
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.warn("Could not load from cache, fetching from API.");
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
        if (forceRefresh) {
          setCooldown(COOLDOWN_SECONDS);
        }
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
    [toast]
  );

  useEffect(() => {
    try {
      const cachedMode =
        (localStorage.getItem(CACHE_KEY_MODE) as Mode) || "quotes";
      setMode(cachedMode);

      const { clickedKey } = getCacheKeys(cachedMode);
      const cachedClicked = localStorage.getItem(clickedKey);
      if (cachedClicked) {
        setClickedSentences(new Set(JSON.parse(cachedClicked)));
      }

      const cachedAutoOpen = localStorage.getItem(CACHE_KEY_AUTO_OPEN);
      if (cachedAutoOpen) {
        setIsAutoOpen(JSON.parse(cachedAutoOpen));
      }

      loadSentences(cachedMode);
    } catch (e) {
      loadSentences("quotes");
    }
  }, [loadSentences]);

  useEffect(() => {
    const triggerAutoOpen = () => {
      if (!isAutoOpen || isLoading || sentences.length === 0) {
        return;
      }

      const unclickedSentence = sentences.find(
        (s) => !clickedSentences.has(s.q)
      );

      if (unclickedSentence) {
        autoOpenTimeoutRef.current = setTimeout(() => {
          const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(
            `"${unclickedSentence.q}" ${unclickedSentence.a}`
          )}&qs=PN&form=TSFLBL`;
          window.open(searchUrl, "_blank");
          handleSentenceClick(unclickedSentence.q);
        }, AUTO_OPEN_DELAY);
      } else {
        // All sentences have been clicked, turn off auto mode.
        setIsAutoOpen(false);
        localStorage.setItem(CACHE_KEY_AUTO_OPEN, JSON.stringify(false));
      }
    };

    triggerAutoOpen();

    return () => {
      if (autoOpenTimeoutRef.current) {
        clearTimeout(autoOpenTimeoutRef.current);
      }
    };
  }, [isAutoOpen, sentences, clickedSentences, isLoading]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleSentenceClick = (sentence: string) => {
    setClickedSentences((prevClicked) => {
      const newClicked = new Set(prevClicked).add(sentence);
      const { clickedKey } = getCacheKeys(mode);
      localStorage.setItem(clickedKey, JSON.stringify(Array.from(newClicked)));
      return newClicked;
    });
  };

  const handleRegenerate = () => {
    if (isLoading || (mode === "random" && cooldown > 0)) return;

    setClickedSentences(new Set());
    const { clickedKey } = getCacheKeys(mode);
    localStorage.removeItem(clickedKey);

    loadSentences(mode, true);
  };

  const handleModeChange = (newModeStr: string) => {
    const newMode = newModeStr as Mode;
    setMode(newMode);

    // Stop any ongoing auto-opening process
    if (autoOpenTimeoutRef.current) {
      clearTimeout(autoOpenTimeoutRef.current);
    }

    const { clickedKey } = getCacheKeys(newMode);
    const cachedClicked = localStorage.getItem(clickedKey);
    if (cachedClicked) {
      setClickedSentences(new Set(JSON.parse(cachedClicked)));
    } else {
      setClickedSentences(new Set());
    }

    loadSentences(newMode, false);
    localStorage.setItem(CACHE_KEY_MODE, newMode);
  };

  const handleAutoOpenChange = (checked: boolean) => {
    setIsAutoOpen(checked);
    localStorage.setItem(CACHE_KEY_AUTO_OPEN, JSON.stringify(checked));
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

  const isRegenerateDisabled = isLoading || (mode === "random" && cooldown > 0);

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
          ) : mode === "random" && cooldown > 0 ? (
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
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-open-mode"
            checked={isAutoOpen}
            onCheckedChange={handleAutoOpenChange}
          />
          <Label htmlFor="auto-open-mode">Auto-Open</Label>
        </div>
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
