import { IResult } from 'mssql';
import { connectDB } from '../config/db';

interface QueryParams {
  [key: string]: string | number | boolean | Date;
}

export async function executeQuery<T>(query: string, params: QueryParams = {}): Promise<T[]> {
  try {
    // Her sorgu için yeni bir bağlantı oluştur
    const pool = await connectDB();
    const request = pool.request();
    
    // Parametreleri ekle
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result: IResult<T> = await request.query(query);
    
    // Bağlantıyı kapat
    await pool.close();
    
    return result.recordset;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
} 