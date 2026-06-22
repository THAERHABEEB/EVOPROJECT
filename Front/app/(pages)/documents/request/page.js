'use client'

import { useState } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'

// ── Data ─────────────────────────────────────────────────────────────────────
const REQUEST_TYPES = {
  enrollment: {
    label: 'Enrollment Certificate',
    docs: [
      { label: 'Student National ID',             type: 'text' },
      { label: 'Parent National ID (if required)', type: 'text' },
      { label: 'Payment Receipt',                  type: 'text' },
      { label: 'Student ID / Student Code',        type: 'text' },
    ],
  },
  metro: {
    label: 'Metro Subscription',
    docs: [
      { label: 'Student ID',                   type: 'text' },
      { label: 'Parent ID',                    type: 'text' },
      { label: 'Personal Photo (4×6)',          type: 'file', accept: 'image/*' },
      { label: 'Recent Enrollment Certificate', type: 'file', accept: '.pdf,image/*' },
      { label: 'Metro Application Form',        type: 'file', accept: '.pdf,image/*' },
    ],
  },
  military: {
    label: 'Military Status Document',
    docs: [
      { label: 'National ID',                   type: 'text' },
      { label: 'Birth Certificate',              type: 'file', accept: '.pdf,image/*' },
      { label: '3 Personal Photos',              type: 'file', accept: 'image/*' },
      { label: 'Recent Enrollment Certificate',  type: 'file', accept: '.pdf,image/*' },
      { label: 'Military Card (if available)',   type: 'file', accept: '.pdf,image/*' },
    ],
  },
  transcript: {
    label: 'Transcript',
    docs: [
      { label: 'National ID',           type: 'text' },
      { label: 'Student Card',          type: 'text' },
      { label: 'Payment Receipt',       type: 'text' },
      { label: 'Official Request Form', type: 'file', accept: '.pdf,image/*' },
    ],
  },
  idcard: {
    label: 'Student ID Card',
    docs: [
      { label: 'Personal Photo',    type: 'file', accept: 'image/*' },
      { label: 'National ID',       type: 'text' },
      { label: 'Payment Receipt',   type: 'text' },
      { label: 'Registration Form', type: 'file', accept: '.pdf,image/*' },
    ],
  },
  transfer: {
    label: 'College Transfer',
    docs: [
      { label: 'Enrollment Statement',  type: 'file', accept: '.pdf,image/*' },
      { label: 'Grade Report',          type: 'file', accept: '.pdf,image/*' },
      { label: 'National ID',           type: 'text' },
      { label: 'Official Transfer Form',type: 'file', accept: '.pdf,image/*' },
    ],
  },
  excuse: {
    label: 'Semester Excuse',
    docs: [
      { label: 'Official Request',        type: 'file', accept: '.pdf,image/*' },
      { label: 'National ID',             type: 'text' },
      { label: 'Excuse Reason Document',  type: 'file', accept: '.pdf,image/*' },
      { label: 'Enrollment Statement',    type: 'file', accept: '.pdf,image/*' },
    ],
  },
}

const INITIAL_REQUESTS = [
  {
    id: 1, studentName: 'Menna Elwy', studentId: '247101', type: 'enrollment',
    comment: '', status: 'pending', pickupDate: '',
    docValues: { 'Student National ID': '29901120100234', 'Parent National ID (if required)': '26512301234567', 'Payment Receipt': 'REC-2024-001', 'Student ID / Student Code': 'HITU-247101' },
  },
]

const statusColor = {
  pending:  { bg: 'rgba(255,193,7,0.15)',  border: '#ffc107', text: '#ffc107' },
  approved: { bg: 'rgba(76,175,80,0.15)',  border: '#4caf50', text: '#4caf50' },
  rejected: { bg: 'rgba(244,67,54,0.15)', border: '#f44336', text: '#f44336' },
}
const statusLabel = { pending: 'Pending', approved: 'Approved ✓', rejected: 'Rejected ✗' }

export default function StudentRequestPage() {
  const [reqType, setReqType]     = useState('enrollment')
  const [docValues, setDocValues] = useState({})
  const [fileObjects, setFileObjects] = useState({})
  const [comment, setComment]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [myRequests, setMyRequests] = useState(INITIAL_REQUESTS)

  const currentDocs = REQUEST_TYPES[reqType]?.docs ?? []

  const handleTypeChange = (val) => { setReqType(val); setDocValues({}); setFileObjects({}) }
  const handleDocValue = (doc, val, file) => {
    setDocValues(prev => ({ ...prev, [doc]: val }))
    if (file) setFileObjects(prev => ({ ...prev, [doc]: file }))
  }

  const handleStudentSubmit = (e) => {
    e.preventDefault()
    const newReq = {
      id: Date.now(), studentName: 'Abdulrahman Reda', studentId: '247818',
      type: reqType, comment, status: 'pending', pickupDate: '',
      docValues: { ...docValues },
    }
    setMyRequests(prev => [newReq, ...prev])
    setDocValues({}); setFileObjects({}); setComment(''); setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3500)
  }

  return (
    <>
      <Header title="Submit Document Request" />
      <div style={{ minHeight: '100vh', padding: '90px 20px 100px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <GlassCard title="📋 Submit a New Document Request">
            <form onSubmit={handleStudentSubmit}>
              <label style={labelStyle}>Document Type</label>
              <select value={reqType} onChange={e => handleTypeChange(e.target.value)} style={selectStyle}>
                {Object.entries(REQUEST_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>

              <label style={{ ...labelStyle, marginTop: 4 }}>Required Document Details</label>
              <div style={{
                background: 'rgba(201,134,10,0.06)', border: '1px solid rgba(201,134,10,0.25)',
                borderRadius: 12, padding: '16px 18px', marginBottom: 18,
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {currentDocs.map(doc => (
                  <div key={doc.label}>
                    {doc.type === 'file' ? (
                      <div style={{ position: 'relative' }}>
                        <input type="file" required accept={doc.accept || '*'} id={`file-${doc.label}`} onChange={e => {
                          const file = e.target.files[0]
                          handleDocValue(doc.label, file?.name || '', file)
                        }} style={{ display: 'none' }} />
                        <label htmlFor={`file-${doc.label}`} style={{
                          ...selectStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                          color: docValues[doc.label] ? '#4caf50' : 'rgba(255, 255, 255, 0.5)', borderStyle: 'dashed',
                        }}>
                          <span>📁</span> <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docValues[doc.label] || `Click to upload ${doc.label}`}</span>
                          {docValues[doc.label] && <span style={{ color: '#4caf50', fontWeight: 700 }}>✓</span>}
                        </label>
                      </div>
                    ) : (
                      <input type="text" required placeholder={`Enter: ${doc.label}`} value={docValues[doc.label] || ''} onChange={e => handleDocValue(doc.label, e.target.value)} style={{ ...selectStyle, marginBottom: 0, direction: 'ltr' }} />
                    )}
                  </div>
                ))}
              </div>

              <label style={labelStyle}>Additional Notes (optional)</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Any extra notes..." rows={3} style={{ ...selectStyle, resize: 'vertical' }} />
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
                    <tr>{['Document', 'Status', 'Pickup Date', 'Notes'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {myRequests.map(req => {
                      const sc = statusColor[req.status]
                      return (
                        <tr key={req.id}>
                          <td style={tdStyle}>{REQUEST_TYPES[req.type]?.label}</td>
                          <td style={tdStyle}><span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 13, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{statusLabel[req.status]}</span></td>
                          <td style={{ ...tdStyle, color: req.pickupDate ? '#4caf50' : '#888' }}>{req.pickupDate || '—'}</td>
                          <td style={{ ...tdStyle, color: '#aaa', fontSize: 13 }}>{req.comment || '—'}</td>
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
        textarea::placeholder, input::placeholder { color: rgba(255, 255, 255, 0.4); }
      `}</style>
    </>
  )
}

function GlassCard({ title, children, style = {} }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '28px 26px', ...style }}>
      {title && <h2 style={{ color: '#c9860a', fontSize: 20, marginBottom: 22, fontWeight: 700 }}>{title}</h2>}
      {children}
    </div>
  )
}

const labelStyle   = { display: 'block', color: '#c9a96e', fontSize: 14, fontWeight: 600, marginBottom: 8 }
const selectStyle  = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(201,134,10,0.35)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, marginBottom: 16, outline: 'none' }
const btnGoldStyle = { padding: '11px 28px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#c9860a,#e6a820)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'opacity 0.2s', width: '100%' }
const alertStyle   = { padding: '12px 16px', borderRadius: 10, borderLeft: '4px solid', fontSize: 14, color: '#eee', marginBottom: 0 }
const tableStyle   = { width: '100%', borderCollapse: 'collapse', fontSize: 14 }
const thStyle      = { padding: '10px 14px', background: 'rgba(201,134,10,0.12)', color: '#c9860a', fontWeight: 700, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }
const tdStyle      = { padding: '11px 14px', color: '#ddd', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle' }
