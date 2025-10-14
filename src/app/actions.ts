'use server';

export async function regenerateSentencesAction(): Promise<string[] | null> {
  // This function is no longer called by the component but is kept for now.
  // The logic has been moved to the client in SentenceExplorer.
  try {
    const response = await fetch('https://api.quotable.io/quotes/random?limit=5', {
      cache: 'no-store',
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.map((quote: { content: string }) => quote.content);
  } catch (error) {
    console.error('Failed to fetch sentences:', error);
    return null;
  }
}
