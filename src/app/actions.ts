'use server';

/**
 * Shuffles an array in place and returns the shuffled array.
 * @param array The array to shuffle.
 */
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export async function regenerateSentencesAction(
  currentSentences: string[]
): Promise<string[] | null> {
  // Shuffles the provided sentences and returns them.
  // This avoids a network call and operates locally.
  try {
    return shuffle([...currentSentences]);
  } catch (error) {
    console.error('Error shuffling sentences:', error);
    return null;
  }
}