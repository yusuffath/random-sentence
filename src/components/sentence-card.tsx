'use client';

import type { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SentenceCardProps {
  sentence: string;
  isClicked: boolean;
  onClick: () => void;
}

const SentenceCard: FC<SentenceCardProps> = ({ sentence, isClicked, onClick }) => {
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(sentence)}&qs=PN&form=TSFLBL`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group block h-full transition-transform duration-300 ease-in-out hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
    >
      <Card
        className={cn(
          'h-full transition-all duration-300 border-2',
          isClicked
            ? 'bg-card/50 border-dashed border-muted-foreground/50'
            : 'bg-card/80 backdrop-blur-sm border-transparent shadow-lg group-hover:border-primary/50 group-hover:shadow-xl'
        )}
      >
        <CardContent className="p-4 flex items-center justify-between gap-4 h-full">
          <p className={cn(
            "font-medium transition-colors",
            isClicked ? "text-muted-foreground" : "text-foreground"
          )}>
            {sentence}
          </p>
          <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 shrink-0 transition-opacity duration-300 group-hover:opacity-100" />
        </CardContent>
      </Card>
    </a>
  );
};

export default SentenceCard;
