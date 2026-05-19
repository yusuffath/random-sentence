import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://assets.msn.com/service/news/feed?market=en-xl&%24top=50&apikey=0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM",
      {
        headers: {
          "Accept": "application/json",
        },
        // Optionally cache the request to avoid hitting the MSN API too often
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch articles", details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
