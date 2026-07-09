'use client'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Bell, BellOff, LogOut, Lock } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  async function handlePushToggle() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications not supported on this browser.')
      return
    }

    setPushLoading(true)
    try {
      if (!pushEnabled) {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') {
          alert('Notification permission denied.')
          setPushLoading(false)
          return
        }

        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })

        await fetch('/api/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub }),
        })
        setPushEnabled(true)
      } else {
        await fetch('/api/push-subscription', { method: 'DELETE' })
        setPushEnabled(false)
      }
    } catch (err) {
      console.error(err)
    }
    setPushLoading(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPass.length < 6) { setPassMsg('New password must be at least 6 chars'); return }
    setPassLoading(true)
    setPassMsg('')
    // For v1, just a simple PUT to a change-password route
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
    })
    setPassLoading(false)
    if (res.ok) {
      setPassMsg('Password changed.')
      setOldPass('')
      setNewPass('')
    } else {
      const d = await res.json()
      setPassMsg(d.error || 'Failed to change password')
    }
  }

  return (
    <div className="page-content" style={{ paddingTop: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* User info */}
      <div className="card" style={{ marginBottom: '16px', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#3A3A38', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 12px', fontSize: '22px', fontWeight: 700,
        }}>
          {session?.user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <p style={{ fontWeight: 600 }}>{session?.user?.name}</p>
        <p style={{ color: '#888884', fontSize: '13px' }}>{session?.user?.email}</p>
      </div>

      {/* Push notifications */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {pushEnabled ? <Bell size={20} /> : <BellOff size={20} color="#888884" />}
            <div>
              <p style={{ fontWeight: 600, fontSize: '15px' }}>Payment Reminders</p>
              <p style={{ color: '#888884', fontSize: '12px' }}>{pushEnabled ? 'Notifications on' : 'Tap to enable'}</p>
            </div>
          </div>
          <button
            onClick={handlePushToggle}
            disabled={pushLoading}
            style={{
              width: '48px', height: '28px', borderRadius: '14px',
              background: pushEnabled ? '#22C55E' : '#3A3A38',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: '4px',
              left: pushEnabled ? '24px' : '4px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#FFFFFF', transition: 'left 0.2s',
              display: 'block',
            }} />
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Lock size={18} />
          <p style={{ fontWeight: 600 }}>Change Password</p>
        </div>
        <form onSubmit={handleChangePassword} className="form-gap">
          <input type="password" placeholder="Current password" value={oldPass} onChange={e => setOldPass(e.target.value)} />
          <input type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)} />
          {passMsg && <p style={{ fontSize: '13px', color: passMsg === 'Password changed.' ? '#22C55E' : '#EF4444' }}>{passMsg}</p>}
          <button type="submit" className="btn btn-ghost" disabled={passLoading}>
            {passLoading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>

      {/* Logout */}
      <button
        className="btn btn-danger"
        onClick={() => signOut({ callbackUrl: '/' })}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <LogOut size={18} />
        Sign out
      </button>
    </div>
  )
}
