"use client"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const [loading, setLoading] = useState(true)
  const [valid, setValid] = useState(false)
  const [error, setError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token parametresi eksik')
      setLoading(false)
      return
    }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) setValid(true)
        else setError(data.error || 'Geçersiz veya süresi dolmuş token')
      })
      .catch(() => setError('Token doğrulanırken hata oluştu'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }
    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalı')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Şifre sıfırlama başarısız')
      }
    } catch {
      setError('Şifre sıfırlama sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl mb-4">Şifre Sıfırla</h1>
      {loading && <p>Yükleniyor...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !success && valid && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">Yeni Şifre</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Şifreyi Onayla</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>Şifreyi Sıfırla</Button>
        </form>
      )}
      {!loading && success && (
        <>
          <p className="text-green-600 mb-4">Şifreniz başarıyla güncellendi.</p>
          <Link href="/auth/login" className="text-blue-600">Giriş Yap</Link>
        </>
      )}
    </div>
  )
}
