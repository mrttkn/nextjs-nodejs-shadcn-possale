import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { executeQuery } from '@/backend/utils/dbUtils';

interface Table {
  DineInTableID: number;
  DineInTableText: string;
}

export async function GET() {
  try {
    await connectDB();
    const tables = await executeQuery<Table>(
      'SELECT DineInTableID, DineInTableText FROM dineInTables WHERE TableGroupID = 1 AND DineInTableActive = 1 and BranchID = 3'
    );
    
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 