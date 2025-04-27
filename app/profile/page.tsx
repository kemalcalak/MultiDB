'use client';
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      console.log('Session yok, giriş yapmanız gerekiyor');
      router.push('/auth/login');
      return;
    }
    // Profil verisini çek
    fetch('/api/auth/profile', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session!.user as any).token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setName(data.user.name);
          setEmail(data.user.email);
        }
      })
      .catch(() => setError('Profil yüklenirken hata oluştu'));
  }, [session, status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    if (password && password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    // Güncelleme isteği
    const body: any = { name };
    if (password) body.password = password;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session!.user as any).token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profil başarıyla güncellendi');
      } else {
        setError(data.error || 'Güncelleme başarısız');
      }
    } catch {
      setError('Sunucu hatası');
    }
  }

  if (status === 'loading') return <p>Yükleniyor...</p>;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl mb-4">Profilim</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">İsim</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} disabled />
        </div>
        <div>
          <Label htmlFor="password">Yeni Şifre (isteğe bağlı)</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Şifre Onay (isteğe bağlı)</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button type="submit">Güncelle</Button>
      </form>
      <hr className="my-4" />
      <Button variant="secondary" onClick={() => signOut()}>Çıkış Yap</Button>
    </div>
  );
}
