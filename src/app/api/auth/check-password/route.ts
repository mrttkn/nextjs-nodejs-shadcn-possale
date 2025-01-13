import { NextResponse } from 'next/server';
import { executeQuery } from '@/backend/utils/dbUtils';

interface Employee {
  AccessCode: string;
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    const employees = await executeQuery<Employee>(
      'SELECT AccessCode FROM EmployeeFiles WHERE EmployeeActive = 1 AND AccessCode = @password',
      { password }
    );
    
    const isValid = employees.length > 0;
    
    return NextResponse.json({ 
      success: true, 
      isValid 
    });
  } catch (error) {
    console.error('Password check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 