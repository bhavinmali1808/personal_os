import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main
      style={{
        background: '#1F1F1E',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', opacity: 0.5 }}>
        <Image src="/icon-192.png" alt="personal_os logo" width={24} height={24} style={{ borderRadius: '6px' }} />
        <p
          style={{
            color: '#FFFFFF',
            fontSize: '13px',
            letterSpacing: '0.2em',
            fontWeight: 400,
            margin: 0
          }}
        >
          personal_os
        </p>
      </div>

      <p
        style={{
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 400,
          marginBottom: '48px',
          textAlign: 'center',
          letterSpacing: '-0.01em',
        }}
      >
        Download it and use it.
      </p>

      <Link
        href="/signup"
        style={{
          display: 'inline-block',
          border: '1px solid #FFFFFF',
          color: '#FFFFFF',
          background: 'transparent',
          padding: '13px 40px',
          borderRadius: '100px',
          fontSize: '14px',
          fontWeight: 500,
          textDecoration: 'none',
          letterSpacing: '0.02em',
        }}
      >
        Get started
      </Link>
    </main>
  )
}
