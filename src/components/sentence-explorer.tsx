'use client';

import { useState, useEffect, useMemo } from 'react';
import SentenceCard from './sentence-card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const ALL_SENTENCES = [
  "To be happy is to be able to become aware of oneself without fright.",
  "The higher we are placed, the more humbly we should walk.",
  "Government of the people, by the people, for the people, shall not perish from the Earth.",
  "By accepting yourself and being fully what you are, your presence can make others happy.",
  "A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing.",
  "The only true wisdom is in knowing you know nothing.",
  "An unexamined life is not worth living.",
  "The journey of a thousand miles begins with a single step.",
  "That which does not kill us makes us stronger.",
  "Life is what happens when you’re busy making other plans.",
  "The purpose of our lives is to be happy.",
  "Get busy living or get busy dying.",
  "You only live once, but if you do it right, once is enough.",
  "Many of life’s failures are people who did not realize how close they were to success when they gave up.",
  "If you want to live a happy life, tie it to a goal, not to people or things.",
  "Never let the fear of striking out keep you from playing the game.",
  "Money and success don’t change people; they merely amplify what is already there.",
  "Your time is limited, so don’t waste it living someone else’s life.",
  "Not how long, but how well you have lived is the main thing.",
  "If life were predictable it would cease to be life, and be without flavor.",
  "The whole secret of a successful life is to find out what is one’s destiny to do, and then do it.",
  "In order to write about life first you must live it.",
  "The big lesson in life, baby, is never be scared of anyone or anything.",
  "Curiosity about life in all of its aspects, I think, is still the secret of great creative people.",
  "Life is not a problem to be solved, but a reality to be experienced.",
  "The unexamined life is not worth living.",
  "Turn your wounds into wisdom.",
  "The way to get started is to quit talking and begin doing.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
  "You will face many defeats in life, but never let yourself be defeated.",
  "In the end, it's not the years in your life that count. It's the life in your years.",
  "Life is a succession of lessons which must be lived to be understood.",
  "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.",
  "Never doubt that a small group of thoughtful, committed citizens can change the world; indeed, it's the only thing that ever has.",
  "Life is trying things to see if they work.",
  "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.",
  "Life is a flower of which love is the honey.",
  "Keep smiling, because life is a beautiful thing and there's so much to smile about.",
  "Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.",
  "You have power over your mind - not outside events. Realize this, and you will find strength.",
  "The mind is everything. What you think you become.",
  "We are what we think. All that we are arises with our thoughts. With our thoughts, we make the world.",
  "The best way to predict the future is to create it.",
  "I have not failed. I've just found 10,000 ways that won't work.",
  "A person who never made a mistake never tried anything new.",
  "The only person you are destined to become is the person you decide to be.",
  "Believe you can and you’re halfway there.",
  "Everything you’ve ever wanted is on the other side of fear.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts."
];


type Mode = "random" | "today" | "quotes";

function shuffle(array: string[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function SentenceExplorer() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>("random");

  const todaySentences = useMemo(() => ALL_SENTENCES.slice(0, 5), []);
  const randomSentences = useMemo(() => shuffle(ALL_SENTENCES).slice(0, 10), []);

  const loadSentences = (currentMode: Mode) => {
    setIsLoading(true);
    // Simulate a network request
    setTimeout(() => {
      if (currentMode === 'random') {
        setSentences(shuffle(ALL_SENTENCES).slice(0, 10));
      } else if (currentMode === 'today') {
        setSentences(todaySentences);
      } else if (currentMode === 'quotes') {
        setSentences(ALL_SENTENCES);
      }
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadSentences(mode);
  }, [mode, todaySentences]);

  const handleSentenceClick = (sentence: string) => {
    setClickedSentences((prev) => new Set(prev).add(sentence));
  };

  const handleRegenerate = () => {
    setClickedSentences(new Set());
    loadSentences(mode);
  };

  const handleModeChange = (newMode: string) => {
    if (newMode === 'random' || newMode === 'today' || newMode === 'quotes') {
        setMode(newMode as Mode);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center sm:text-left">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
            Sentence Explorer
            </h1>
            <p className="text-muted-foreground mt-1">Discover and explore new ideas.</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
            <RadioGroup defaultValue="random" onValueChange={handleModeChange} className="flex gap-2 sm:gap-4 p-1 bg-secondary rounded-full">
              <div className="flex items-center">
                <RadioGroupItem value="random" id="r1" className="sr-only" />
                <Label htmlFor="r1" className="px-4 py-1.5 rounded-full cursor-pointer transition-colors text-sm font-medium data-[state=checked]:bg-background data-[state=checked]:shadow">Random</Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="today" id="r2" className="sr-only" />
                <Label htmlFor="r2" className="px-4 py-1.5 rounded-full cursor-pointer transition-colors text-sm font-medium data-[state=checked]:bg-background data-[state=checked]:shadow">Today's Picks</Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="quotes" id="r3" className="sr-only" />
                <Label htmlFor="r3" className="px-4 py-1.5 rounded-full cursor-pointer transition-colors text-sm font-medium data-[state=checked]:bg-background data-[state=checked]:shadow">All Quotes</Label>
              </div>
            </RadioGroup>
          <Button onClick={handleRegenerate} variant="ghost" size="icon" className="shrink-0" disabled={isLoading || mode === 'quotes'}>
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Regenerate</span>
          </Button>
        </div>
      </header>

      {isLoading && sentences.length === 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {Array.from({ length: mode === 'quotes' ? 20 : 10 }).map((_, i) => (
             <Card key={i} className="h-28 animate-pulse bg-muted/50"></Card>
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
