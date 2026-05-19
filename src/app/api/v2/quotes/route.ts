'use server';

import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const mode = searchParams.get('mode') || 'random';

  let apiUrl;
  switch (mode) {
    case 'today':
      apiUrl = 'https://api.viewbits.com/v1/zenquotes?mode=today';
      break;
    case 'quotes':
      apiUrl = 'https://api.viewbits.com/v1/zenquotes?mode=batch';
      break;
    case 'random':
    default:
      apiUrl = 'https://api.viewbits.com/v1/zenquotes?mode=random';
      break;
  }

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {error: `Failed to fetch from viewbits API: ${errorText}`},
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
