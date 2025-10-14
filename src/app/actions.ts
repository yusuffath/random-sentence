'use server';

/**
 * This action is no longer used but kept to prevent build errors.
 * The sentence generation is now handled client-side with a static list.
 */
export async function regenerateSentencesAction(): Promise<string[] | null> {
  return null;
}
