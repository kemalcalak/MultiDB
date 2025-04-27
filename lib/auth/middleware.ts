import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export async function authMiddleware(req: NextRequest) {
  // Authorization header'ı al
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Yetkilendirme başarısız. Token bulunamadı' },
      { status: 401 }
    );
  }

  // Token'ı ayıkla (Bearer kısmını kaldır)
  const token = authHeader.split(' ')[1];

  // Token'ı doğrula
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: 'Geçersiz veya süresi dolmuş token' },
      { status: 401 }
    );
  }

  return decoded;
}

// Bir kullanıcının kimliğini doğrulamak için yardımcı fonksiyon
export async function authenticateUser(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}
