'use client';

import { useState, useEffect } from 'react';
import SentenceCard from './sentence-card';

const FALLBACK_SENTENCES = [
  'To be happy is to be able to become aware of oneself without fright.',
  'The higher we are placed, the more humbly we should walk.',
  'Government of the people, by the people, for the people, shall not perish from the Earth.',
  'By accepting yourself and being fully what you are, your presence can make others happy.',
  'A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing.',
];

export default function SentenceExplorer() {
  const [sentences] = useState<string[]>(FALLBACK_SENTENCES);
  const [clickedSentences, setClickedSentences] = useState<Set<string>>(new Set());

  const handleSentenceClick = (sentence: string) => {
    setClickedSentences((prev) => new Set(prev).add(sentence));
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-center sm:text-left">
          Sentence Explorer
        </h1>
      </header>

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
    </div>
  );
}
