'use server';

import { generateNewSentences } from '@/ai/flows/generate-new-sentences';

export async function regenerateSentencesAction(): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.error('Gemini API key is missing or is a placeholder.');
    return [];
  }
  
  try {
    const result = await generateNewSentences({});
    return result.sentences;
  } catch (error) {
    console.error('Error generating new sentences:', error);
    // In a real app, you might want to return a more structured error response.
    // For now, we'll return an empty array and log the error on the server.
    return [];
  }
}
