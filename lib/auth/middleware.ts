import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

// Rol tipini tanımlayalım
type Role = 'customer' | 'supplier' | 'all';

/**
 * Rol tabanlı kimlik doğrulama middleware'i
 * @param req - Gelen istek
 * @param allowedRoles - İzin verilen roller listesi ('all' herkese izin verir)
 */
export async function authMiddleware(
  req: NextRequest, 
  allowedRoles: Role[] = ['all']
) {
  // Kullanıcı bilgilerini doğrula
  const user = await authenticateUser(req);
  
  // Kullanıcı doğrulanamadıysa hata döndür
  if (!user) {
    return NextResponse.json(
      { error: 'Kimlik doğrulama başarısız: Geçersiz veya eksik token' },
      { status: 401 }
    );
  }

  // Rol kontrolü: 'all' herkes için erişim sağlar, aksi takdirde rol kontrolü yapılır
  if (allowedRoles.includes('all') || allowedRoles.includes(user.role as Role)) {
    // İsteğe kullanıcı bilgilerini ekle
    return NextResponse.next({
      headers: {
        'X-User-Id': user.id.toString(),
        'X-User-Email': user.email,
        'X-User-Role': user.role,
      },
    });
  }
  
  // İzin verilmeyen rol için erişim reddedildi
  return NextResponse.json(
    { error: 'Erişim reddedildi: Bu işlem için yetkiniz yok' },
    { status: 403 }
  );
}

// Bir kullanıcının kimliğini doğrulamak için yardımcı fonksiyon
export async function authenticateUser(req: NextRequest) {
  // Authorization header'ından token'ı al
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Token'ı çıkar ve doğrula
  const token = authHeader.substring(7); // 'Bearer ' kısmını çıkar
  const decodedToken = verifyToken(token);
  
  return decodedToken;
}
