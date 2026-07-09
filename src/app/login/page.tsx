'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/app')
    }
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100dvh', padding: '40px 24px' }}>
      <p style={{ fontSize: '13px', letterSpacing: '0.2em', opacity: 0.4, marginBottom: '40px' }}>personal_os</p>
      <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '32px' }}>Sign in</h1>

      <form onSubmit={handleSubmit} className="form-gap">
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
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <p style={{ color: '#EF4444', fontSize: '14px' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ color: '#888884', fontSize: '14px', marginTop: '28px', textAlign: 'center' }}>
        No account?{' '}
        <Link href="/signup" style={{ color: '#FFFFFF' }}>Sign up</Link>
      </p>
    </div>
  )
}
