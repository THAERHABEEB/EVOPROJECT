'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import { api } from '@/lib/api'

const statusColor = {
  pending:  { bg: 'rgba(255,193,7,0.15)',  border: '#ffc107', text: '#ffc107' },
  approved: { bg: 'rgba(76,175,80,0.15)',  border: '#4caf50', text: '#4caf50' },
  rejected: { bg: 'rgba(244,67,54,0.15)', border: '#f44336', text: '#f44336' },
}
const statusLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }

export default function AdminRequestPage() {
  const router = useRouter()
  const [allRequests, setAllRequests] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.studentRequests.getAll()
        if (res.status === 'success' && res.data) {
          setAllRequests(res.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const res = await api.studentRequests.update(id, { status })
      if (res.status === 'success') {
        setAllRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
        if (selectedReq?.id === id) setSelectedReq(prev => ({ ...prev, status }))
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  return (
    <>
      <Header title="Admin — Document Requests" />
      <div style={{ minHeight: '100vh', padding: '90px 20px 100px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          {/* LEFT: Requests List */}
          <div style={{ flex: '1 1 500px' }}>
            <GlassCard title="🛡️ Student Requests — Admin Dashboard">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Total', value: allRequests.length, color: '#c9860a' },
                  { label: 'Pending', value: allRequests.filter(r => r.status === 'pending').length, color: '#ffc107' },
                  { label: 'Approved', value: allRequests.filter(r => r.status === 'approved').length, color: '#4caf50' },
                  { label: 'Rejected', value: allRequests.filter(r => r.status === 'rejected').length, color: '#f44336' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '16px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {loading ? <p style={{ color: '#aaa', textAlign: 'center' }}>Loading requests...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {allRequests.map(req => {
                    const sc = statusColor[req.status] || statusColor.pending
                    const isSelected = selectedReq?.id === req.id
                    const reqDate = new Date(req.create_at).toLocaleDateString()
                    return (
                      <div key={req.id} onClick={() => setSelectedReq(req)} style={{ 
                        ...reqCardStyle, 
                        borderColor: isSelected ? '#c9860a' : 'rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(201,134,10,0.1)' : 'rgba(255,255,255,0.02)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: 16 }}>{req.student_name || `Student #${req.student_id}`}</div>
                            <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>{req.student_id || req.student_code} • {req.type_title}</div>
                          </div>
                          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{statusLabel[req.status] || req.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#888' }}>{reqDate}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </GlassCard>
          </div>

          {/* RIGHT: Request Details */}
          <div style={{ flex: '1 1 350px' }}>
            <GlassCard title="🔍 Request Details">
              {selectedReq ? (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={detailLabelStyle}>Student Name</div>
                    <div style={detailValueStyle}>{selectedReq.student_name || 'N/A'}</div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={detailLabelStyle}>Student ID</div>
                    <div style={detailValueStyle}>{selectedReq.student_id || selectedReq.student_code || 'N/A'}</div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={detailLabelStyle}>Specialization</div>
                    <div style={detailValueStyle}>{selectedReq.specialization || 'N/A'}</div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={detailLabelStyle}>Document Type</div>
                    <div style={detailValueStyle}>{selectedReq.type_title || 'N/A'}</div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={detailLabelStyle}>Notes / Comments</div>
                    <div style={{ ...detailValueStyle, background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, fontStyle: selectedReq.notes ? 'normal' : 'italic', color: selectedReq.notes ? '#fff' : '#666' }}>
                      {selectedReq.notes || 'No notes provided by the student.'}
                    </div>
                  </div>

                  {selectedReq.img && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={detailLabelStyle}>Attached Document / Photo</div>
                      <div style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
                        {selectedReq.img.startsWith('data:image') || selectedReq.img.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={selectedReq.img} alt="Attachment" style={{ width: '100%', display: 'block' }} />
                        ) : (
                          <a href={selectedReq.img} target="_blank" rel="noreferrer" style={{ display: 'block', padding: 20, color: '#c9860a', textAlign: 'center', textDecoration: 'none' }}>
                            📄 View Attached Document
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
                    <button 
                      onClick={() => updateStatus(selectedReq.id, 'approved')}
                      disabled={selectedReq.status === 'approved'}
                      style={{ ...actionBtnStyle, background: selectedReq.status === 'approved' ? 'rgba(76,175,80,0.2)' : '#4caf50', color: selectedReq.status === 'approved' ? '#4caf50' : '#fff', border: '1px solid #4caf50' }}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      onClick={() => updateStatus(selectedReq.id, 'rejected')}
                      disabled={selectedReq.status === 'rejected'}
                      style={{ ...actionBtnStyle, background: selectedReq.status === 'rejected' ? 'rgba(244,67,54,0.2)' : '#f44336', color: selectedReq.status === 'rejected' ? '#f44336' : '#fff', border: '1px solid #f44336' }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#aaa', textAlign: 'center', padding: '40px 0', fontStyle: 'italic' }}>
                  Select a request from the list to view details.
                </div>
              )}
            </GlassCard>
          </div>

        </div>
      </div>
      <CircularMenu />
    </>
  )
}

// ── Reusable Styles ──────────────────────────────────────────────────────────
const GlassCard = ({ title, children, style }) => (
  <div style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, ...style }}>
    <h3 style={{ margin: '0 0 24px', fontSize: 20, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>{title}</h3>
    {children}
  </div>
)

const reqCardStyle = {
  padding: '16px 20px', borderRadius: 16, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s'
}

const detailLabelStyle = {
  fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 500
}

const detailValueStyle = {
  fontSize: 16, color: '#fff'
}

const actionBtnStyle = {
  flex: 1, padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s',
  opacity: 1
}
