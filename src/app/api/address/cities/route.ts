import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://tradres.com.tr/api/iller', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const cities = await response.json();
    console.log('API Response:', cities);
    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 