'use server';

/**
 * @fileOverview Generates a new list of sentences using an LLM.
 *
 * - generateNewSentences - A function that generates a new list of sentences.
 * - GenerateNewSentencesInput - The input type for the generateNewSentences function (currently empty).
 * - GenerateNewSentencesOutput - The return type for the generateNewSentences function, which is a list of sentences.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewSentencesInputSchema = z.object({});
export type GenerateNewSentencesInput = z.infer<typeof GenerateNewSentencesInputSchema>;

const GenerateNewSentencesOutputSchema = z.object({
  sentences: z.array(z.string()).describe('A list of newly generated sentences.'),
});
export type GenerateNewSentencesOutput = z.infer<typeof GenerateNewSentencesOutputSchema>;

export async function generateNewSentences(
  input: GenerateNewSentencesInput
): Promise<GenerateNewSentencesOutput> {
  return generateNewSentencesFlow(input);
}

const generateNewSentencesPrompt = ai.definePrompt({
  name: 'generateNewSentencesPrompt',
  input: {schema: GenerateNewSentencesInputSchema},
  output: {schema: GenerateNewSentencesOutputSchema},
  prompt: `You are an AI that generates a list of sentences.  The user has requested a new set of sentences.

  Generate a list of 5 different sentences.  The sentences should be varied in topic and structure.

  Sentences:`, // Intentionally not using Handlebars syntax since there are no input variables.
});

const generateNewSentencesFlow = ai.defineFlow(
  {
    name: 'generateNewSentencesFlow',
    inputSchema: GenerateNewSentencesInputSchema,
    outputSchema: GenerateNewSentencesOutputSchema,
  },
  async input => {
    const {output} = await generateNewSentencesPrompt(input);
    return output!;
  }
);
