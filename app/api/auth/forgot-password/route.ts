import { NextResponse } from 'next/server';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { Op } from 'sequelize';

// Şifre sıfırlama isteği için endpoint
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Girdi doğrulama
    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi zorunludur' },
        { status: 400 }
      );
    }

    // Kullanıcıyı e-posta adresine göre bul
    const user = await User.findOne({ where: { email } });

    // Kullanıcı bulunamadıysa - güvenlik açısından aynı mesajı döndür
    // Bu, saldırganların geçerli e-posta adreslerini öğrenmesini engeller
    if (!user) {
      return NextResponse.json(
        { message: 'Şifre sıfırlama talimatları e-posta adresinize gönderildi' },
        { status: 200 }
      );
    }

    // Kullanıcının mevcut aktif reset token'ını bul ve süresi geçtiyse sil
    const existingToken = await ResetToken.findOne({
      where: { 
        userId: user.id, 
        used: false,
        expiresAt: {
          [Op.gt]: new Date() // şu andan sonra sona erecekler
        } 
      }
    });

    // Eğer aktif token varsa kullan, yoksa yeni token oluştur
    let resetToken;
    if (existingToken) {
      resetToken = existingToken.token;
    } else {
      // Benzersiz bir token oluştur
      resetToken = crypto.randomBytes(32).toString('hex');

      // Token süresini 1 saat olarak ayarla
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Token'ı veritabanına kaydet
      await ResetToken.create({
        userId: user.id,
        token: resetToken,
        expiresAt,
        used: false,
      });
    }

    // Sıfırlama linkini oluştur
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // E-posta gönder
    await sendPasswordResetEmail(user.email, resetLink, user.name);

    return NextResponse.json(
      { message: 'Şifre sıfırlama talimatları e-posta adresinize gönderildi' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Şifre sıfırlama isteği sırasında bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama isteği sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
