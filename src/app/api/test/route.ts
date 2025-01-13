import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { executeQuery } from '@/backend/utils/dbUtils';

interface TestResult {
  test: number;
}

export async function GET() {
  try {
    await connectDB();
    const result = await executeQuery<TestResult>('SELECT 1 as test');
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 