import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Validate URL to prevent SSRF attacks
    const url = new URL(imageUrl);
    const allowedHosts = [
      'source.unsplash.com',
      'images.unsplash.com',
      'api.dicebear.com',
      'picsum.photos',
      'randomuser.me'
    ];

    if (!allowedHosts.includes(url.hostname)) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
    }

    console.log('🔄 Proxying image request:', imageUrl);

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` }, 
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Check if it's actually an image
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Response is not an image' }, { status: 400 });
    }

    const imageBuffer = await response.arrayBuffer();
    
    console.log('✅ Successfully proxied image, size:', imageBuffer.byteLength);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
