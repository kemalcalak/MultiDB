import { NextResponse } from 'next/server';
import User from '@/models/User';
import { createToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Girdi doğrulama
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tüm alanların doldurulması gerekiyor' },
        { status: 400 }
      );
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin' },
        { status: 400 }
      );
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Kullanıcının daha önce kayıt olup olmadığını kontrol et
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı bir kullanıcı zaten var' },
        { status: 409 }
      );
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({ name, email, password });

    // JWT token oluştur
    const token = createToken({ id: user.id, email: user.email });

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return NextResponse.json({
      message: 'Kullanıcı başarıyla kayıt edildi',
      user: userData,
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
