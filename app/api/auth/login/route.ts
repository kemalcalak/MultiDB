import { NextResponse } from 'next/server';
import User, { comparePassword } from '@/models/User';
import { createToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Girdi doğrulama
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });

    // Kullanıcı bulunamadı veya şifre yanlış
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // JWT token oluştur
    const token = createToken({ id: user.id, email: user.email });

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
