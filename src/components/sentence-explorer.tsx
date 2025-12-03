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
import ArticleCard from "./article-card";

type Quote = {
  q: string;
  a: string;
};

type Article = {
  id: string;
  title: string;
  url: string;
  imageUrl?: string;
};

type Mode = "random" | "today" | "quotes" | "article";

const COOLDOWN_SECONDS = 30;
const AUTO_OPEN_DELAY = 5000;

export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<Quote[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(
    new Set()
  );
  const [clickedArticles, setClickedArticles] = useState<Set<string>>(
    new Set()
  );
  const [mode, setMode] = useState<Mode>("quotes");
  const [cooldown, setCooldown] = useState(0);
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const autoOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const CACHE_KEY_SENTENCES_PREFIX = "sentenceExplorer_sentences";
  const CACHE_KEY_ARTICLES_PREFIX = "sentenceExplorer_articles";
  const CACHE_KEY_CLICKED_SENTENCES_PREFIX =
    "sentenceExplorer_clicked_sentences";
  const CACHE_KEY_CLICKED_ARTICLES_PREFIX = "sentenceExplorer_clicked_articles";
  const CACHE_KEY_MODE = "sentenceExplorer_mode";
  const CACHE_KEY_AUTO_OPEN = "sentenceExplorer_autoOpen";

  const getCacheKeys = (mode: Mode) => ({
    sentencesKey: `${CACHE_KEY_SENTENCES_PREFIX}_${mode}`,
    articlesKey: `${CACHE_KEY_ARTICLES_PREFIX}`,
    clickedSentencesKey: `${CACHE_KEY_CLICKED_SENTENCES_PREFIX}_${mode}`,
    clickedArticlesKey: `${CACHE_KEY_CLICKED_ARTICLES_PREFIX}`,
  });

  const loadSentences = useCallback(
    async (currentMode: Mode, forceRefresh = false) => {
      setIsLoading(true);

      if (currentMode === "article") {
        const { articlesKey } = getCacheKeys(currentMode);
        if (!forceRefresh) {
          try {
            const cachedArticles = localStorage.getItem(articlesKey);
            if (cachedArticles) {
              setArticles(JSON.parse(cachedArticles));
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.warn(
              "Could not load articles from cache, fetching from API."
            );
          }
        }
        try {
          const response = await fetch(
            "https://assets.msn.com/service/news/feed?market=en-xl&%24top=50&apikey=0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM"
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch articles from API.");
          }

          const newArticles =
            data.value?.[0]?.subCards
              ?.map((card: any) => ({
                id: card.id,
                title: card.title,
                url: card.url,
                imageUrl: card.images?.[0]?.url,
              }))
              .filter(
                (article: Article) =>
                  article.id && article.title && article.url && article.imageUrl
              ) || [];

          setArticles(newArticles);
          localStorage.setItem(articlesKey, JSON.stringify(newArticles));
        } catch (error) {
          console.error("Error loading articles:", error);
          toast({
            variant: "destructive",
            title: "Could not fetch articles.",
            description:
              error instanceof Error
                ? error.message
                : "Please check your network connection and try again.",
          });
          setArticles([]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

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

      const { clickedSentencesKey, clickedArticlesKey } =
        getCacheKeys(cachedMode);
      const cachedClickedSentences = localStorage.getItem(clickedSentencesKey);
      if (cachedClickedSentences) {
        setClickedSentences(new Set(JSON.parse(cachedClickedSentences)));
      }
      const cachedClickedArticles = localStorage.getItem(clickedArticlesKey);
      if (cachedClickedArticles) {
        setClickedArticles(new Set(JSON.parse(cachedClickedArticles)));
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
      if (!isAutoOpen || isLoading) {
        return;
      }

      if (mode === "article") {
        const unclickedArticle = articles.find(
          (a) => !clickedArticles.has(a.id)
        );
        if (unclickedArticle) {
          autoOpenTimeoutRef.current = setTimeout(() => {
            window.open(unclickedArticle.url, "_blank");
            handleArticleClick(unclickedArticle.id);
          }, AUTO_OPEN_DELAY);
        } else {
          setIsAutoOpen(false);
          localStorage.setItem(CACHE_KEY_AUTO_OPEN, JSON.stringify(false));
        }
      } else {
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
      }
    };

    triggerAutoOpen();

    return () => {
      if (autoOpenTimeoutRef.current) {
        clearTimeout(autoOpenTimeoutRef.current);
      }
    };
  }, [
    isAutoOpen,
    sentences,
    articles,
    clickedSentences,
    clickedArticles,
    isLoading,
    mode,
  ]);

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
      const { clickedSentencesKey } = getCacheKeys(mode);
      localStorage.setItem(
        clickedSentencesKey,
        JSON.stringify(Array.from(newClicked))
      );
      return newClicked;
    });
  };

  const handleArticleClick = (articleId: string) => {
    setClickedArticles((prevClicked) => {
      const newClicked = new Set(prevClicked).add(articleId);
      const { clickedArticlesKey } = getCacheKeys(mode);
      localStorage.setItem(
        clickedArticlesKey,
        JSON.stringify(Array.from(newClicked))
      );
      return newClicked;
    });
  };

  const handleRegenerate = () => {
    if (isLoading || (mode === "random" && cooldown > 0)) return;

    if (mode === "article") {
      setClickedArticles(new Set());
      const { clickedArticlesKey } = getCacheKeys(mode);
      localStorage.removeItem(clickedArticlesKey);
    } else {
      setClickedSentences(new Set());
      const { clickedSentencesKey } = getCacheKeys(mode);
      localStorage.removeItem(clickedSentencesKey);
    }

    loadSentences(mode, true);
  };

  const handleModeChange = (newModeStr: string) => {
    const newMode = newModeStr as Mode;
    setMode(newMode);

    if (autoOpenTimeoutRef.current) {
      clearTimeout(autoOpenTimeoutRef.current);
    }

    if (newMode === "article") {
      const { clickedArticlesKey } = getCacheKeys(newMode);
      const cachedClicked = localStorage.getItem(clickedArticlesKey);
      setClickedArticles(
        cachedClicked ? new Set(JSON.parse(cachedClicked)) : new Set()
      );
    } else {
      const { clickedSentencesKey } = getCacheKeys(newMode);
      const cachedClicked = localStorage.getItem(clickedSentencesKey);
      setClickedSentences(
        cachedClicked ? new Set(JSON.parse(cachedClicked)) : new Set()
      );
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
      case "article":
        return "Article Explorer";
    }
  }, [mode]);

  const isRegenerateDisabled = isLoading || (mode === "random" && cooldown > 0);

  const renderContent = () => {
    if (mode === "article") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.length > 0 ? (
            articles.map((article) => (
              <div
                key={article.id}
                className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500 ease-out"
              >
                <ArticleCard
                  title={article.title}
                  imageUrl={article.imageUrl!}
                  url={article.url}
                  isClicked={clickedArticles.has(article.id)}
                  onClick={() => handleArticleClick(article.id)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No articles to display.</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sentences.length > 0 ? (
          sentences.map((quote) => (
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
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No quotes to display.</p>
          </div>
        )}
      </div>
    );
  };

  const skeletonsCount = useMemo(() => {
    if (mode === "quotes" || mode === "article") return 12;
    return 1;
  }, [mode]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <header className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Quote className="h-12 w-12 text-primary/80" />
          <h1 className="text-5xl md:text-6xl font-bold font-headline tracking-tight">
            {title}
          </h1>
        </div>
        <p className="text-muted-foreground text-xl max-w-2xl">
          Discover profound and inspiring quotes or explore the latest articles.
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
            <TabsTrigger value="article">Article</TabsTrigger>
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
              <span>New Content</span>
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
          {Array.from({ length: skeletonsCount }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-card/20"></Card>
          ))}
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}
