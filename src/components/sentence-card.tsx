'use client';

import type { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SentenceCardProps {
  sentence: string;
  author: string;
  isClicked: boolean;
  onClick: () => void;
}

const SentenceCard: FC<SentenceCardProps> = ({ sentence, author, isClicked, onClick }) => {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${sentence}" ${author}`)}`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group block h-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg"
    >
      <Card
        className={cn(
          'h-full flex flex-col justify-between transition-all duration-300 ease-in-out',
          'bg-card/30 backdrop-blur-sm border-border/20 shadow-lg',
          'hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1',
          isClicked && 'opacity-40 hover:opacity-100 border-dashed'
        )}
      >
        <CardContent className="p-6 flex-grow">
          <blockquote className="text-lg font-medium text-foreground relative">
            <span className="absolute -left-3 -top-2 text-6xl text-primary/10 font-serif">“</span>
            {sentence}
          </blockquote>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-between items-center">
          <p className="text-sm font-mono text-muted-foreground">- {author}</p>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 shrink-0 transition-opacity duration-300 group-hover:opacity-100" />
        </CardFooter>
      </Card>
    </a>
  );
};

export default SentenceCard;
