import { NextResponse } from 'next/server';
import { executeQuery } from '@/backend/utils/dbUtils';

interface Table {
  DineInTableID: number;
  DineInTableText: string;
}

export async function GET(
  request: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableId = params.tableId;
    
    const tables = await executeQuery<Table>(
      'SELECT DineInTableID, DineInTableText FROM dineInTables WHERE DineInTableID = @tableId AND TableGroupID = 1 AND DineInTableActive = 1 AND BranchID = 3',
      { tableId }
    );
    
    if (tables.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: tables[0] });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 