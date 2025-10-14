'use server';

type Quote = {
  _id: string;
  content: string;
  author: string;
};

/**
 * Fetches new sentences from the Quotable API.
 */
export async function regenerateSentencesAction(): Promise<string[] | null> {
  try {
    const response = await fetch('https://api.quotable.io/quotes/random?limit=5', {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('API responded with an error:', response.statusText);
      return null;
    }

    const data: Quote[] = await response.json();
    return data.map((quote) => quote.content);
  } catch (error) {
    console.error('Error fetching new sentences:', error);
    return null;
  }
}
