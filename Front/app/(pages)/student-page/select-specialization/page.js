'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const SPECIALIZATIONS = [
  'Data Science', 'AI', 'Cyber Security', 'Garment', 'Control', 'Mechatronics', 'Auto tronics'
]

export default function SelectSpecializationPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('Data Science')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) router.push('/login')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) throw new Error('Missing userId')

      await api.studentsSpecialization.update(userId, { specialization: selected })
      // After setting specialization, go to student page
      router.push('/student-page')
    } catch (err) {
      console.error(err)
      setError(err.data?.error || err.message || 'Could not save selection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '15px' }}>
      <div style={{ width: '100%', maxWidth: 760, padding: 28, borderRadius: 12, background: 'rgba(10,10,20,0.6)', color: '#fff' }}>
        <h2 style={{ color: '#c19a6b' }}>Select Your Specialization</h2>
        <p>Please choose the specialization that applies to you. This will only be requested once.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ padding: '12px 14px', width: '100%', borderRadius: 8 }}>
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {error && <div style={{ color: '#ff8080', marginBottom: 10 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading} style={{ background: '#c19a6b', border: 'none', padding: '10px 18px', borderRadius: 8, color: '#000', fontWeight: 700 }}>
              {loading ? 'Saving…' : 'Save Specialization'}
            </button>
            <button type="button" onClick={() => router.push('/student-page')} style={{ background: 'transparent', border: '1px solid #555', padding: '10px 18px', borderRadius: 8, color: '#fff' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
