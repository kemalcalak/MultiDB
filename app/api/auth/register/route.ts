import { NextResponse } from 'next/server';
import User from '@/models/User';
import { createToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const { name, email, password, role = 'customer' } = await request.json();

    // Girdi doğrulama
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'İsim, email ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // Rol doğrulama
    if (role !== 'customer' && role !== 'supplier') {
      return NextResponse.json(
        { error: 'Geçersiz rol: Sadece "customer" veya "supplier" olabilir' },
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
    const user = await User.create({ name, email, password, role });

    // JWT token oluştur (rol bilgisini içerecek şekilde)
    const token = createToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return NextResponse.json({
      message: 'Kullanıcı başarıyla kayıt edildi',
      user: userData,
      token
    });
  } catch (error: any) {
    console.error('Kayıt sırasında bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
