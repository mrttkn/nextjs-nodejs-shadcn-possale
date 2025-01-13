import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { cityId: string } }
) {
  try {
    const response = await fetch(`https://tradres.com.tr/api/ilceler?ilkod=${params.cityId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Districts API responded with status: ${response.status}`);
    }

    const districts = await response.json();
    // API yanıtını istediğimiz formata dönüştürelim
    const formattedDistricts = districts.map((district: { ilceAdi: string }) => ({
      id: district.ilceAdi,
      name: district.ilceAdi
    }));

    return NextResponse.json({ success: true, data: formattedDistricts });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 