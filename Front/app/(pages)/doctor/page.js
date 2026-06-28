'use client'
import '@/styles/doctor.css'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import { api } from '@/lib/api'

export default function DoctorPage() {
  const [selectedLecture, setSelectedLecture] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeWeek, setActiveWeek] = useState('Week 1')
  const [showWeeklyModal, setShowWeeklyModal] = useState(false)
  const [doctorData, setDoctorData] = useState(null)
  const [stats, setStats] = useState({ totalStudents: 0, totalLectures: 0, timeline: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const role = localStorage.getItem('userRole')
        if (role !== 'doctor') {
           console.error('Unauthorized access to doctor page')
           window.location.href = '/login'
           return
        }

        let userId = localStorage.getItem('userId')
        const token = localStorage.getItem('token')
        
        if (!userId && token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            userId = payload.id || payload.userId
            if (userId) localStorage.setItem('userId', userId)
          } catch (e) { console.error('Error decoding token:', e) }
        }

        if (!userId) {
          window.location.href = '/login'
          return
        }

        // Fetch basic info
        const res = await api.doctors.getAll({ user_id: userId })
        if (res.status === 'success' && res.data.length > 0) {
          setDoctorData(res.data[0])
        }

        // Fetch stats
        const statsRes = await api.request(`/doctor/${userId}/dashboard-stats`)
        if (statsRes.status === 'success') {
          setStats(statsRes.data)
        }

      } catch (error) {
        console.error('Error fetching doctor data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorData()

    const handleMouseMove = (e) => {
      const glow = document.getElementById('cursor-glow')
      if (glow) {
        glow.style.left = e.clientX + 'px'
        glow.style.top = e.clientY + 'px'
      }
    }
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile(file)
      setUploadStatus(`Selected: ${file.name}`)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.pdf') || file.name.endsWith('.doc'))) {
      setUploadedFile(file)
      setUploadStatus(`Uploading ${file.name}... Success!`)
    } else {
      setUploadStatus('Please upload Excel, PDF, or DOC files only')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  return (
    <>
      <div id="cursor-glow"></div>

      <Header title="Doctor Dashboard" />

      <div className="main-content container-fluid p-3 p-md-4" style={{ maxWidth: '1200px' }}>
        {!loading && (
          <>
            {/* 1. Doctor Profile Banner */}
            <div className="doctor-banner p-4 mb-4" style={{
              backgroundImage: "url('/Pics/11.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '16px',
              position: 'relative',
              color: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, transparent 0%, rgba(21, 32, 54, 0.6) 40%, rgba(21, 32, 54, 0.95) 100%)' }}></div>
              <div className="position-relative d-flex flex-column flex-md-row-reverse align-items-center align-items-md-start" style={{ zIndex: 1 }}>
                <img src={doctorData?.photo || "/Pics/student.jpg"} alt={doctorData?.name} style={{ width: '130px', height: '130px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', marginLeft: '30px', marginBottom: '15px', transition: 'transform 0.3s', objectFit: 'cover' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                <div className="text-center text-md-end mt-2">
                  <h2 style={{ fontWeight: 700, marginBottom: '5px', fontSize: '2.2rem' }}>{doctorData?.name}</h2>
                  <p style={{ fontSize: '1.2rem', marginBottom: '2px', color: '#d1e8ff' }}>{doctorData?.qualification}</p>
                  <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '20px', color: '#a0c4ff' }}>{doctorData?.department}</p>
                  <div className="d-flex justify-content-center justify-content-md-end gap-4">
                    <div className="text-end"><h4 className="mb-0 fw-bold">{doctorData?.rating ? `${doctorData.rating}/5.0` : "N/A"}</h4><small style={{ color: '#a0c4ff' }}>Rating</small></div>
                    <div className="text-end"><h4 className="mb-0 fw-bold">{stats.totalStudents}</h4><small style={{ color: '#a0c4ff' }}>Students</small></div>
                    <div className="text-end"><h4 className="mb-0 fw-bold">{stats.totalLectures}</h4><small style={{ color: '#a0c4ff' }}>Lectures</small></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Active Lecture Bar */}
            <div className="d-flex flex-column flex-md-row-reverse justify-content-between align-items-center mb-4 p-3 px-4" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,245,255,0.7) 100%)', backdropFilter: 'blur(14px)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(43,58,85,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(43,58,85,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(43,58,85,0.08)'; }}>
              <div>
                <div className="mb-3 mb-md-0 text-center text-md-end">
                  <div className="d-flex align-items-center justify-content-end gap-2 mb-1">
                    <span style={{ background: 'linear-gradient(to right, #c4a16b, #e0c89c)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>NEXT SESSION</span>
                    <h4 style={{ color: '#2b3a55', fontWeight: 700, marginBottom: 0, fontSize: '1.3rem' }}>{stats.timeline && stats.timeline[0]?.title || 'No upcoming lectures'}</h4>
                  </div>
                  <div className="d-flex justify-content-end gap-3">
                    <span style={{ color: '#888', fontSize: '0.9rem' }}><i className="bi bi-door-open me-1" style={{ color: '#c4a16b' }}></i>{stats.timeline && stats.timeline[0]?.location || 'N/A'}</span>
                    <span style={{ color: '#888', fontSize: '0.9rem' }}><i className="bi bi-clock me-1" style={{ color: '#c4a16b' }}></i>{stats.timeline && stats.timeline[0]?.time || '--'}</span>
                  </div>
                </div>
                <button 
                  style={{ background: 'linear-gradient(to right, #c4a16b, #e0c89c)', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(196, 161, 107, 0.4)', transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'pointer', marginTop: '10px' }} 
                  onClick={() => window.location.href = '/doctor/live-lecture/1'}
                >
                  <i className="bi bi-broadcast me-2"></i>Start Live Stream
                </button>
              </div>
              
              <div className="mt-4 p-3" style={{ background: 'rgba(232,237,242,0.6)', border: '1px dashed #b0c4de', borderRadius: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.3, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
                <div className="position-relative z-1">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                    <div className="d-flex align-items-center mb-2 mb-md-0">
                      <span style={{ fontWeight: 600, color: '#2b3a55', marginRight: '15px' }}>Upload Content</span>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>Excel, PDF, DOC.</span>
                    </div>
                  </div>
                  <button className="btn w-100" style={{ background: 'linear-gradient(to right, #6b829c, #8ca3ba)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, padding: '10px', boxShadow: '0 4px 10px rgba(107,130,156,0.2)', transition: 'transform 0.25s, box-shadow 0.25s' }} onClick={() => document.getElementById('gradesFile').click()}>
                    <i className="bi bi-cloud-upload me-2"></i>Upload File
                  </button>
                  <input type="file" id="gradesFile" accept=".xlsx,.pdf,.doc" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
              </div>
            </div>

            {/* 3. Main Split Section */}
            <div className="row g-4 mb-4">
              {/* Left Column: Today's Timeline */}
              <div className="col-lg-5">
                <div style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.4))', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px', color: 'white', backgroundImage: "url('/Pics/11.png')", backgroundSize: 'cover', backgroundPosition: 'top', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(85, 110, 143, 0.8), rgba(212, 175, 55, 0.4))' }}></div>
                    <h5 className="position-relative z-1" style={{ margin: 0, fontWeight: 600 }}>Today's Timeline</h5>
                  </div>
                  <div className="p-4 flex-grow-1">
                    {stats.timeline && stats.timeline.length === 0 ? (
                      <div className="text-center text-muted p-4">No lectures scheduled for today.</div>
                    ) : stats.timeline?.map((item, idx) => (
                      <div key={idx}>
                        <div className="mb-3 d-flex justify-content-between align-items-center">
                          <div className="text-start" style={{ minWidth: '120px' }}>
                            <h6 style={{ color: '#c4a16b', fontWeight: 700, margin: 0 }}>{item.time}</h6>
                            <small style={{ color: '#888' }}>To {item.endTime}</small>
                          </div>
                          <div className="text-end">
                            <h6 style={{ color: '#2b3a55', fontWeight: 700 }}>{item.title}</h6>
                            <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: 0 }}>{item.location}</p>
                          </div>
                        </div>
                        {idx < stats.timeline.length - 1 && <hr style={{ opacity: 0.1, margin: '15px 0' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Doctor Information */}
              <div className="col-lg-7">
                <div className="p-4" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 15px 35px rgba(43, 58, 85, 0.08)', height: '100%' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(43,58,85,0.1)' }}>
                    <h4 style={{ color: '#2b3a55', fontWeight: 800, margin: 0 }}>Professional Profile</h4>
                  </div>
                  <div className="row">
                    <div className="col-md-7">
                      <h6 style={{ color: '#2b3a55', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>BIOGRAPHY</h6>
                      <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.7' }}>
                        Professional faculty member at HITU, dedicated to excellence in teaching and research in the {doctorData?.department} department.
                      </p>
                    </div>
                    <div className="col-md-5">
                      <div className="p-3 rounded" style={{ background: 'rgba(43,58,85,0.05)' }}>
                        <p className="mb-2" style={{ fontSize: '0.9rem' }}><i className="bi bi-envelope me-2 text-muted"></i>{doctorData?.email}</p>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}><i className="bi bi-building me-2 text-muted"></i>{doctorData?.officelocation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Quick Actions */}
            <div className="row g-3 mb-4">
              {['Videos', 'Assignments', 'Grading', 'Student Grades'].map((action, i) => (
                <div className="col-md-3" key={i}>
                  <div className="text-white text-center p-4" style={{ 
                    background: i % 2 === 0 ? '#3a4f6d' : 'linear-gradient(135deg, #b8905a, #d4ab7a)', 
                    borderRadius: '14px', 
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                    transition: '0.3s'
                  }} 
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => window.location.href = `/doctor/${action.toLowerCase().replace(' ', '-')}`}
                  >
                    <h5 className="fw-bold mb-0">{action}</h5>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Weekly Schedule Modal */}
      {showWeeklyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '800px', borderRadius: '20px', padding: '30px' }}>
            <h4>Weekly Schedule</h4>
            <div className="text-center py-4 text-muted">Loading schedule data...</div>
            <button className="btn btn-secondary" onClick={() => setShowWeeklyModal(false)}>Close</button>
          </div>
        </div>
      )}

      <CircularMenu loading={loading} />
    </>
  )
}