import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { neighborhoodId: string } }
) {
  try {
    const [ilkod, mahalle] = params.neighborhoodId.split('_');
    
    const cleanMahalle = mahalle.replace(' MAHALLESİ', '');
    
    console.log('Request params:', { ilkod, mahalle: cleanMahalle });
    
    const apiUrl = `https://tradres.com.tr/api/sokaklar?ilkod=${ilkod}&mahalle=${encodeURIComponent(cleanMahalle)}`;
    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API responded with status: ${response.status}, body: ${errorText}`);
    }

    const streets = await response.json();
    console.log('API Response:', streets);

    if (!Array.isArray(streets)) {
      throw new Error('API response is not an array');
    }

    const formattedStreets = streets.map((street: { sokakAdi: string }) => ({
      id: street.sokakAdi,
      name: street.sokakAdi.replace(' (Sokak)', '').replace(' (Cadde)', '')
    }));

    return NextResponse.json({ success: true, data: formattedStreets });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 