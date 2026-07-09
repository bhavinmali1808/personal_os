'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import Image from 'next/image'

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  if (!installPrompt || isInstalled || dismissed) return null

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setInstallPrompt(null)
  }

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '16px',
      right: '16px',
      backgroundColor: '#2A2A28',
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      zIndex: 50,
      border: '1px solid #3A3A38'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Image src="/icon-192.png" alt="Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Install personal_os</p>
          <p style={{ fontSize: '12px', color: '#888884' }}>For a better experience</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={handleInstall} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}>
          <Download size={14} style={{ marginRight: '4px' }} /> Install
        </button>
        <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: '#888884', padding: '4px', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
