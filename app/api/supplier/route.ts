import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';

// Sadece tedarikçiler için erişime izin verilen endpoint
export async function GET(req: NextRequest) {
  // authMiddleware'ı çağırarak önce yetkilendirme yap
  const middlewareResponse = await authMiddleware(req, ['supplier']);
  
  // Middleware bir hata döndürürse (401 veya 403), onu doğrudan döndür
  if (middlewareResponse.status && middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  return NextResponse.json({
    message: 'Tedarikçi paneline hoş geldiniz',
    data: {
      supplies: [
        { id: 1, name: 'Ürün A', stock: 100 },
        { id: 2, name: 'Ürün B', stock: 50 },
      ]
    }
  });
}
