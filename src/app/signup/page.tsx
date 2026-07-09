'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }
      // Auto sign in after signup
      await signIn('credentials', { email, password, redirect: false })
      router.push('/app')
    } catch {
      setError('Server error, try again')
      setLoading(false)
    }
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100dvh', padding: '40px 24px' }}>
      <p style={{ fontSize: '13px', letterSpacing: '0.2em', opacity: 0.4, marginBottom: '40px' }}>personal_os</p>
      <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '32px' }}>Create account</h1>

      <form onSubmit={handleSubmit} className="form-gap">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
        />
        {error && <p style={{ color: '#EF4444', fontSize: '14px' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ color: '#888884', fontSize: '14px', marginTop: '28px', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#FFFFFF' }}>Sign in</Link>
      </p>
    </div>
  )
}
