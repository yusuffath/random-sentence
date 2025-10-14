'use server';

export async function regenerateSentencesAction(): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.quotable.io/quotes/random?limit=5', {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.map((quote: any) => quote.content);
  } catch (error) {
    console.error('Error fetching new sentences:', error);
    return null;
  }
}
