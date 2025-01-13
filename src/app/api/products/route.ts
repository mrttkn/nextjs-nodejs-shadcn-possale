import { NextResponse } from 'next/server';
import { executeQuery } from '@/backend/utils/dbUtils';

interface MenuItem {
  MenuItemKey: string;
  MenuItemText: string;
  DefaultUnitPrice: number;
  MenuGroupID: number;
  MenuGroupText: string;
}

export async function GET() {
  try {
    const products = await executeQuery<MenuItem>(
      `SELECT DISTINCT 
        ngmi.MenuItemKey,
        ngmi.MenuItemText,
        ngmip.DefaultUnitPrice,
        ngmg.MenuGroupID,
        ngmg.MenuGroupText
       FROM NewGlobalMenuItems ngmi
       INNER JOIN NewGlobalMenuGroups ngmg ON ngmg.MenuGroupID = ngmi.MenuGroupID
       LEFT JOIN NewGlobalMenuItemPrices ngmip ON ngmip.MenuItemKey = ngmi.MenuItemKey 
         and ngmip.PriceTemplateKey='95C8230C-C155-423F-8ECF-232BF0CCAC30'
       WHERE MenuItemActive = 1 AND MenuGroupActive = 1
       ORDER BY ngmg.MenuGroupID, ngmi.MenuItemText`
    );
    
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 