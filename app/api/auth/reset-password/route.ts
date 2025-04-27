import { NextResponse } from 'next/server';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';
import {  Op } from 'sequelize';
import bcrypt from 'bcryptjs';

// Şifre sıfırlama işlemi için endpoint
export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // Girdi doğrulama
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token ve yeni şifre zorunludur' },
        { status: 400 }
      );
    }

    // Şifre uzunluk kontrolü
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter uzunluğunda olmalıdır' },
        { status: 400 }
      );
    }

    // Token'ı veritabanında ara
    const resetToken = await ResetToken.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [Op.gt]: new Date() // şu andan sonra sona erecekler
        }
      }
    });

    // Token bulunamadıysa veya süresi dolmuşsa
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await User.findByPk(resetToken.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Kullanıcı şifresini güncelle
    await user.update({ password: hashedPassword });

    // Token'ı kullanıldı olarak işaretle
    await resetToken.update({ used: true });

    return NextResponse.json(
      { message: 'Şifreniz başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Şifre sıfırlama işlemi sırasında bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Token geçerliliğini kontrol eden endpoint
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token parametresi eksik' },
        { status: 400 }
      );
    }

    // Token'ı veritabanında ara
    const resetToken = await ResetToken.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    // Token geçerliliğini kontrol et
    if (resetToken) {
      return NextResponse.json(
        { valid: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { valid: false, error: 'Geçersiz veya süresi dolmuş token' },
        { status: 200 } // Not kullanılabilir olduğunu göstermek için 200
      );
    }
  } catch (error) {
    console.error('Token geçerliliği kontrolü sırasında bir hata oluştu:', error);
    return NextResponse.json(
      { valid: false, error: 'Token kontrolü sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
