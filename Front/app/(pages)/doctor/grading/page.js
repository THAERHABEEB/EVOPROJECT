'use client'
import '@/styles/doctor.css'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'

const MOCK_SUBMISSIONS = [
  { id: 1, studentName: 'Ahmed Ali', studentId: '247202', assignment: 'Logic Circuits Quiz', fileName: 'quiz1_ahmed.pdf', date: '2026-03-10', grade: '', feedback: '' },
  { id: 2, studentName: 'Sara Mohamed', studentId: '247303', assignment: 'Robotics Report', fileName: 'robotics_sara.zip', date: '2026-03-12', grade: 'A', feedback: 'Excellent work!' },
  { id: 3, studentName: 'Omar Hassan', studentId: '247404', assignment: 'Logic Circuits Quiz', fileName: 'quiz1_omar.pdf', date: '2026-03-11', grade: '', feedback: '' },
]

import api from '@/lib/api'

export default function GradingPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [tempGrade, setTempGrade] = useState('')
  const [tempFeedback, setTempFeedback] = useState('')

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) return
        
        const res = await api.request(`/quiz/submissions/doctor/${userId}`)
        if (res.status === 'success') {
          setSubmissions(res.data)
        }
      } catch (err) {
        console.error('Error fetching submissions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()

    const handleMouseMove = (e) => {
      const glow = document.getElementById('cursor-glow')
      if (glow) {
        glow.style.left = e.clientX + 'px'
        glow.style.top = e.clientY + 'px'
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const startGrading = (sub) => {
    setEditingId(sub.id)
    setTempGrade(sub.score)
    setTempFeedback('')
  }

  const saveGrade = async (id) => {
    // For now we just update local state, but normally we'd call an API here
    setSubmissions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, score: tempGrade } : sub
    ))
    setEditingId(null)
    alert('Grade updated locally. In a full implementation, this would sync to the Grade table.')
  }

  return (
    <>
      <div id="cursor-glow"></div>
      <Header title="Grading Submissions" />

      <div className="main-content container-fluid p-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="text-center my-5">
          <h1 style={{ color: '#2b3a55', fontWeight: 800, fontSize: '2.5rem' }}>🎓 Grading Center</h1>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>Review and grade student submissions</p>
        </div>

        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center text-muted">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="col-12 text-center text-muted">No submissions found.</div>
          ) : submissions.map(sub => (
            <div key={sub.id} className="col-12">
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.8)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.9)', 
                  padding: '24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: sub.score !== null ? '#28a745' : '#c4a16b' }}></div>
                
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                  <div className="text-start flex-grow-1">
                    <h5 style={{ color: '#2b3a55', fontWeight: 700, margin: 0 }}>{sub.student_name} <span style={{ fontWeight: 400, color: '#888', fontSize: '0.9rem' }}>(ID: {sub.student_id})</span></h5>
                    <p style={{ margin: '5px 0', color: '#c4a16b', fontWeight: 600 }}>{sub.quiz_title}</p>
                    <div className="d-flex gap-3 align-items-center opacity-75">
                      <small><i className="bi bi-clock"></i> Submitted: {new Date(sub.submitted_at).toLocaleString()}</small>
                    </div>
                  </div>

                  {editingId === sub.id ? (
                    <div className="d-flex flex-column gap-2" style={{ minWidth: '300px' }}>
                      <div className="d-flex gap-2">
                        <input 
                          type="number" 
                          className="form-control" 
                          placeholder="Score" 
                          value={tempGrade} 
                          onChange={e => setTempGrade(e.target.value)}
                          style={{ width: '100px', borderRadius: '8px', border: '1px solid #c4a16b' }}
                        />
                        <span className="align-self-center"> / {sub.total_possible}</span>
                      </div>
                      <div className="d-flex gap-2">
                        <button onClick={() => saveGrade(sub.id)} className="btn w-100" style={{ background: '#2b3a55', color: 'white', borderRadius: '8px', fontWeight: 600 }}>Save</button>
                        <button onClick={() => setEditingId(null)} className="btn btn-light w-100" style={{ borderRadius: '8px' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-4">
                      <div className="text-center">
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: sub.score !== null ? '#28a745' : '#888' }}>{sub.score !== null ? `${sub.score}/${sub.total_possible}` : '—'}</span>
                        <small style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, opacity: 0.6 }}>Score</small>
                      </div>
                      <button 
                        onClick={() => startGrading(sub)} 
                        className="btn" 
                        style={{ background: 'linear-gradient(to right, #c4a16b, #e0c89c)', color: 'white', borderRadius: '10px', padding: '10px 25px', fontWeight: 700, boxShadow: '0 4px 15px rgba(196,161,107,0.3)' }}
                      >
                        {sub.score !== null ? 'Edit Score' : 'Grade Now'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CircularMenu />
    </>
  )
}
