"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok) {
      alert('E‑posta gönderildi')
      router.push('/')
    } else {
      alert('Hata oluştu')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl mb-4">Şifremi Unuttum</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <Button type="submit">Gönder</Button>
      </form>
    <p className="mt-4 text-sm">
        <Link href="/auth/login" className="text-blue-600">
            Giriş Yap
        </Link>
    </p>
    </div>
  )
}
