import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';

// Müşteri için erişime izin verilen endpoint
export async function GET(req: NextRequest) {
  // authMiddleware'ı çağırarak önce yetkilendirme yap
  const middlewareResponse = await authMiddleware(req, ['customer', 'supplier']);
  
  // Middleware bir hata döndürürse (401 veya 403), onu doğrudan döndür
  if (middlewareResponse.status && middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  // Kullanıcı header'larını al
  const userId = req.headers.get('X-User-Id');
  const userEmail = req.headers.get('X-User-Email');
  const userRole = req.headers.get('X-User-Role');

  return NextResponse.json({
    message: 'Korumalı endpointe erişim başarılı',
    user: {
      id: userId,
      email: userEmail,
      role: userRole
    }
  });
}
