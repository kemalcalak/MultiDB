import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';

// Sadece müşteriler için erişime izin verilen endpoint
export async function GET(req: NextRequest) {
  // authMiddleware'ı çağırarak önce yetkilendirme yap
  const middlewareResponse = await authMiddleware(req, ['customer']);
  
  // Middleware bir hata döndürürse (401 veya 403), onu doğrudan döndür
  if (middlewareResponse.status && middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  return NextResponse.json({
    message: 'Müşteri paneline hoş geldiniz',
    data: {
      orders: [
        { id: 101, product: 'Ürün A', quantity: 2, status: 'shipped' },
        { id: 102, product: 'Ürün B', quantity: 1, status: 'processing' },
      ]
    }
  });
}
