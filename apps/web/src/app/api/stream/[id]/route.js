// Stream URL API route (proxy for vidsrc)
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    // Return vidsrc embed URL (server-side only to protect any future API keys)
    const streamUrl = `https://vidsrc.to/embed/movie/${id}`;

    return NextResponse.json({
      streamUrl,
      type: 'embed'
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return NextResponse.json(
      { error: 'Failed to get stream URL' },
      { status: 500 }
    );
  }
}
