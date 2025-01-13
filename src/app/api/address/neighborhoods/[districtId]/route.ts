import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { districtId: string } }
) {
  try {
    const [ilkod, ilceadi] = params.districtId.split('_');
    
    const response = await fetch(`https://tradres.com.tr/api/mahalleler?ilkod=${ilkod}&ilce=${encodeURIComponent(ilceadi)}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const neighborhoods = await response.json();
    const formattedNeighborhoods = neighborhoods.map((neighborhood: { mahalleAdi: string }) => {
      const fullName = neighborhood.mahalleAdi;
      const displayName = neighborhood.mahalleAdi.replace(' MAHALLESİ', '');
      
      return {
        id: fullName,
        name: displayName
      };
    });

    return NextResponse.json({ success: true, data: formattedNeighborhoods });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 