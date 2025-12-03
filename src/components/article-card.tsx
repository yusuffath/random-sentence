"use client";

import type { FC } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink, CheckCircle2 } from "lucide-react";

interface ArticleCardProps {
  title: string;
  imageUrl: string;
  url: string;
  isClicked: boolean;
  onClick: () => void;
}

const ArticleCard: FC<ArticleCardProps> = ({
  title,
  imageUrl,
  url,
  isClicked,
  onClick,
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group block h-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg"
    >
      <Card
        className={cn(
          "h-full relative flex flex-col justify-between transition-all duration-300 ease-in-out",
          "bg-card/30 backdrop-blur-sm border-border/20 shadow-lg overflow-hidden",
          "hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1",
          isClicked && "opacity-40 hover:opacity-100 border-dashed"
        )}
      >
        {isClicked && (
          <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary/50 z-10" />
        )}
        <CardHeader className="p-0 relative aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col justify-end">
          <h3 className="text-base font-semibold text-foreground relative z-10">
            {title}
          </h3>
        </CardContent>
        <CardContent className="p-4 pt-0 flex justify-end">
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 shrink-0 transition-opacity duration-300 group-hover:opacity-100" />
        </CardContent>
      </Card>
    </a>
  );
};

export default ArticleCard;
