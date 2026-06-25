'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import api from '@/app/utils/api'

const statusColor = {
  pending:  { bg: 'rgba(255,193,7,0.15)',  border: '#ffc107', text: '#ffc107' },
  approved: { bg: 'rgba(76,175,80,0.15)',  border: '#4caf50', text: '#4caf50' },
  rejected: { bg: 'rgba(244,67,54,0.15)', border: '#f44336', text: '#f44336' },
}
const statusLabel = { pending: 'Pending', approved: 'Approved ✓', rejected: 'Rejected ✗' }

export default function StudentRequestPage() {
  const router = useRouter()
  const [reqTypes, setReqTypes] = useState([])
  const [reqType, setReqType] = useState('')
  const [notes, setNotes] = useState('')
  const [imgBase64, setImgBase64] = useState('')
  const [imgName, setImgName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [myRequests, setMyRequests] = useState([])
  const [studentInfo, setStudentInfo] = useState({
    name: '', code: '', year: '', specialization: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          router.push('/login')
          return
        }

        // Fetch student profile
        const studentRes = await api.students.getByUserId(userId)
        if (studentRes.status === 'success' && studentRes.data) {
          const data = studentRes.data
          setStudentInfo({
            name: data.name || '',
            code: data.code || '',
            year: data.year_level || '',
            specialization: data.department || ''
          })
        }

        // Fetch request types
        const typesRes = await fetch('/api/request_type', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        if (typesRes.ok) {
          const typesJson = await typesRes.json()
          if (typesJson.data) {
            setReqTypes(typesJson.data)
            if (typesJson.data.length > 0) setReqType(typesJson.data[0].id)
          }
        }

        // Fetch previous requests
        const reqRes = await fetch('/api/student_request', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        if (reqRes.ok) {
          const reqJson = await reqRes.json()
          if (reqJson.data) setMyRequests(reqJson.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [router])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImgName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImgBase64(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStudentSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/student_request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          type_request_id: reqType, 
          notes, 
          img: imgBase64 
        })
      })
      if (res.ok) {
        const result = await res.json()
        if (result.data) {
          setMyRequests(prev => [result.data, ...prev])
        }
        setNotes('')
        setImgBase64('')
        setImgName('')
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3500)
      }
    } catch (err) {
      console.error('Error submitting request:', err)
    }
  }

  return (
    <>
      <Header title="Submit Document Request" />
      <div style={{ minHeight: '100vh', padding: '90px 20px 100px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <GlassCard title="📋 Submit a New Document Request">
            <form onSubmit={handleStudentSubmit}>
              
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Student ID / Code</label>
                  <input type="text" readOnly value={studentInfo.code} style={readOnlyStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Student Name</label>
                  <input type="text" readOnly value={studentInfo.name} style={readOnlyStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Study Year</label>
                  <input type="text" readOnly value={studentInfo.year} style={readOnlyStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Specialization</label>
                  <input type="text" readOnly value={studentInfo.specialization} style={readOnlyStyle} />
                </div>
              </div>

              <label style={labelStyle}>Document Type</label>
              <select value={reqType} onChange={e => setReqType(e.target.value)} style={selectStyle} required>
                {reqTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.title}</option>
                ))}
              </select>

              <label style={labelStyle}>Upload Photo / Document (Optional)</label>
              <div style={{ position: 'relative', marginBottom: 18 }}>
                <input type="file" accept="image/*,.pdf" id="upload-img" onChange={handleFileChange} style={{ display: 'none' }} />
                <label htmlFor="upload-img" style={uploadLabelStyle}>
                  <span>{imgName ? `📁 ${imgName}` : 'Click to upload photo or document'}</span>
                  {imgName && <span style={{ color: '#4caf50', fontWeight: 700 }}>✓</span>}
                </label>
              </div>

              <label style={labelStyle}>Notes</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Any extra notes or details for the Student Affairs department..." 
                rows={4} 
                style={textareaStyle} 
              />
              
              {submitted && (
                <div style={{ ...alertStyle, borderColor: '#4caf50', background: 'rgba(76,175,80,0.1)', marginBottom: 14 }}>
                  ✅ Your request was submitted successfully!
                </div>
              )}
              <button type="submit" style={btnGoldStyle}>Submit Request</button>
            </form>
          </GlassCard>

          <GlassCard title="📄 My Previous Requests" style={{ marginTop: 28 }}>
            {myRequests.length === 0 ? <p style={{ color: '#aaa', textAlign: 'center' }}>No previous requests found.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>{['Document', 'Status', 'Date', 'Notes'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {myRequests.map(req => {
                      const sc = statusColor[req.status] || statusColor.pending
                      // Try to find title if it came from JOIN, or fallback to frontend types
                      const docTitle = req.type_title || reqTypes.find(t => t.id == req.type_request_id)?.title || 'Request'
                      const reqDate = new Date(req.create_at).toLocaleDateString()
                      return (
                        <tr key={req.id}>
                          <td style={tdStyle}>{docTitle}</td>
                          <td style={tdStyle}><span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{statusLabel[req.status] || req.status}</span></td>
                          <td style={{ ...tdStyle, color: '#aaa' }}>{reqDate}</td>
                          <td style={{ ...tdStyle, color: '#aaa', fontSize: 13 }}>{req.notes || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
      <CircularMenu />
    </>
  )
}

// ── Reusable Styles ──────────────────────────────────────────────────────────
const GlassCard = ({ title, children, style }) => (
  <div style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, ...style }}>
    <h3 style={{ margin: '0 0 24px', fontSize: 22, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>{title}</h3>
    {children}
  </div>
)

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '16px',
  marginBottom: '20px'
}

const readOnlyStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
  color: '#888', fontSize: 15, outline: 'none'
}

const labelStyle = { display: 'block', marginBottom: 8, fontSize: 14, color: '#bbb', fontWeight: 500 }

const selectStyle = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff', fontSize: 15, outline: 'none', marginBottom: 18,
  transition: 'border-color 0.2s'
}

const textareaStyle = {
  ...selectStyle,
  resize: 'vertical',
  fontFamily: 'inherit',
  minHeight: '100px',
  lineHeight: '1.5'
}

const uploadLabelStyle = {
  ...selectStyle, 
  marginBottom: 0, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between',
  cursor: 'pointer',
  color: '#bbb', 
  borderStyle: 'dashed',
  borderWidth: '2px',
  borderColor: 'rgba(201,134,10,0.4)',
  background: 'rgba(201,134,10,0.05)'
}

const btnGoldStyle = {
  width: '100%', padding: '14px',
  background: 'linear-gradient(135deg, #c9860a, #e6a820)',
  color: '#000', fontSize: 16, fontWeight: 700, borderRadius: 12,
  border: 'none', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s',
  boxShadow: '0 4px 15px rgba(201,134,10,0.3)',
}

const alertStyle = { padding: '12px 16px', borderRadius: 12, border: '1px solid', fontSize: 15 }
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: 600 }
const thStyle = { textAlign: 'left', padding: '12px 16px', color: '#888', fontWeight: 500, fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }
const tdStyle = { padding: '16px', color: '#fff', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.03)' }
