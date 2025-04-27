"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'customer'|'supplier'>('customer')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    if (res.ok) router.push('/auth/login')
    else alert('Kayıt başarısız')
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl mb-4">Kayıt Ol</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">İsim ve Soyad</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Şifre</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="role">Rol</Label>
          <Select value={role} onValueChange={value => setRole(value as 'customer'|'supplier')}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Rol seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Müşteri</SelectItem>
              <SelectItem value="supplier">Tedarikçi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Kayıt Ol</Button>
      </form>
    <p className="mt-4 text-sm">
        Zaten hesabın var mı?{' '}
        <Link href="/auth/login" className="text-blue-600">
            Giriş Yap
        </Link>
    </p>
    </div>
  )
}
