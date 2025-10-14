'use server';

import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const mode = searchParams.get('mode') || 'random'; // Default to 'random'

  let apiUrl;
  switch (mode) {
    case 'today':
      apiUrl = 'https://zenquotes.io/api/today';
      break;
    case 'quotes':
      apiUrl = 'https://zenquotes.io/api/quotes';
      break;
    case 'random':
    default:
      apiUrl = 'https://zenquotes.io/api/random';
      break;
  }

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        // ZenQuotes API can sometimes be slow or cached; this helps.
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {error: `Failed to fetch from ZenQuotes API: ${errorText}`},
        {status: response.status}
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in proxy API route:', error);
    return NextResponse.json(
      {error: 'Internal Server Error'},
      {status: 500}
    );
  }
}
