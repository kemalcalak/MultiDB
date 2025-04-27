import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey12345';
const JWT_EXPIRES_IN = '7d'; // 7 gün geçerli token

// JWT payload tipini genişletiyoruz, role alanını ekleyerek
interface JWTPayload {
  id: number;
  email: string;
  role: string; // Rol bilgisi eklendi
}

// Token oluşturma
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

// Token doğrulama
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
