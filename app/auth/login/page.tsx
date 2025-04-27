"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) router.push('/')
    else alert('Giriş başarısız')
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl mb-4">Giriş Yap</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Giriş Yap</Button>
      </form>
    <p className="mt-4 text-sm">
        <Link href="/auth/forgot-password" className="text-blue-600">
            Şifremi unuttum
        </Link>
        {' • '}
        <Link href="/auth/register" className="text-blue-600">
            Kayıt Ol
        </Link>
    </p>
    </div>
  )
}
