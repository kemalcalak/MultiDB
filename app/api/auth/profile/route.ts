import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { authenticateUser } from '@/lib/auth/middleware';
import { createToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

// GET: Mevcut kullanıcıyı getir
export async function GET(req: NextRequest) {
  const decoded = await authenticateUser(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await User.findByPk(decoded.id);
  if (!user) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
  }
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  return NextResponse.json({ user: userData }, { status: 200 });
}

export async function PUT(req: NextRequest) {
	// 1. Kullanıcıyı doğrula
	const decoded = await authenticateUser(req);
	if (!decoded) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// 2. Kullanıcıyı bul
	const user = await User.findByPk(decoded.id);
	if (!user) {
		return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
	}

	// 3. Güncellenecek alanları al (email artık değiştirilemez)
	const { name, password } = await req.json();

	// 4. Değişiklikleri hazırla (sadece isim ve şifre)
	const updates: Partial<{ name: string; password: string }> = {};
	if (name) updates.name = name;
	if (password) {
		const salt = await bcrypt.genSalt(10);
		updates.password = await bcrypt.hash(password, salt);
	}

	// 5. Güncelle ve yeni token üret
	await user.update(updates);
	const token = createToken({ id: user.id, email: user.email, role: user.role });

	// 6. Yanıt
	const userData = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role
	};
	return NextResponse.json({
		message: 'Profil başarıyla güncellendi',
		user: userData,
		token
	});
}
