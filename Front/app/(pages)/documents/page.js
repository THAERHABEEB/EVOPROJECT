'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DocumentsRedirect() {
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role === 'student affairs') {
      router.push('/documents/admin')
    } else {
      router.push('/documents/request')
    }
  }, [router])

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#0a0a0a',
      color: '#c9860a',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '10px' }}>Loading Documents Portal...</h2>
        <div className="loader"></div>
      </div>
      <style>{`
        .loader {
          border: 4px solid rgba(201, 134, 10, 0.1);
          border-left-color: #c9860a;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
