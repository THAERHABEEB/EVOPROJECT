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
  const [loading, setLoading] = useState(true)
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({ title: '', details: '', course_id: 'CS101', file_url: '', image_url: '', start_date: '', end_date: '', total_grade: 100 })
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        let userId = localStorage.getItem('userId')
        const token = localStorage.getItem('token')
        
        // Fallback: Decode token if userId is missing
        if (!userId && token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            userId = payload.id
            if (userId) {
              localStorage.setItem('userId', userId)
              console.log('Recovered userId from token:', userId)
            }
          } catch (e) {
            console.error('Error decoding token:', e)
          }
        }

        console.log('Fetching doctor data for userId:', userId)
        
        if (!userId) {
          console.error('No userId found in localStorage or token')
          setLoading(false)
          return
        }

        // Search for doctor record by user_id
        const response = await api.doctors.getAll({ user_id: userId })
        if (response.status === 'success' && response.data.length > 0) {
          const currentDoctor = response.data.find(d => String(d.user_id) === String(userId)) || response.data[0]
          setDoctorData(currentDoctor)
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

  const fetchSubmissions = async () => {
    if (!doctorData?.id) return;
    try {
      const res = await api.assignments.getSubmissionsForDoctor(doctorData.id);
      if (res.status === 'success') setSubmissions(res.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  }

  useEffect(() => {
    if (showAssignmentModal) fetchSubmissions();
  }, [showAssignmentModal, doctorData]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const data = { ...assignmentForm, doctor_id: doctorData.id };
      const res = await api.assignments.createCourseAssignment(data);
      if (res.status === 'success') {
        alert('Assignment dispatched successfully!');
        setShowAssignmentModal(false);
      }
    } catch (err) {
      alert('Error creating assignment');
    }
  };

  const handleGradeSubmission = async (subId, grade) => {
    try {
      const res = await api.assignments.gradeSubmission({ submission_id: subId, grade });
      if (res.status === 'success') {
        alert('Graded successfully!');
        fetchSubmissions();
      }
    } catch (err) {
      alert('Error grading submission');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile(file)
      setUploadStatus(`Selected: ${file.name}`)
      setTimeout(() => {
        alert(`File ${file.name} sent successfully to all enrolled students!`);
        setUploadStatus('');
        setUploadedFile(null);
      }, 1000);
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

      {/* Logout button top right for quick access if needed, or implement into header */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000 }}>
        <button 
          className="btn btn-sm" 
          onClick={() => {
            if (confirm('Are you sure you want to logout?')) {
              localStorage.removeItem('token')
              localStorage.removeItem('userId')
              sessionStorage.clear()
              window.location.href = '/login'
            }
          }}
          style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', fontWeight: 600 }}
        >
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>

      <div className="main-content container-fluid p-3 p-md-4" style={{ maxWidth: '1200px' }}>

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
            <img 
              src={doctorData?.photo || "/Pics/student.jpg"} 
              alt={doctorData?.name || "Dr. Sherif Ibrahim"} 
              style={{ width: '130px', height: '130px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', marginLeft: '30px', marginBottom: '15px', transition: 'transform 0.3s', objectFit: 'cover', cursor: 'zoom-in' }} 
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} 
              onClick={() => setIsPhotoExpanded(true)}
            />
            <div className="text-center text-md-end mt-2">
              <h2 style={{ fontWeight: 700, marginBottom: '5px', fontSize: '2.2rem' }}>{doctorData?.name || "Dr. Sherif Ibrahim"}</h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '2px', color: '#d1e8ff' }}>{doctorData?.qualification || "Assistant Professor"}</p>
              <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '20px', color: '#a0c4ff' }}>{doctorData?.department || "Mechatronics Department"}</p>
              <div className="d-flex justify-content-center justify-content-md-end gap-4">
                <div className="text-end"><h4 className="mb-0 fw-bold">{doctorData?.rating ? `${doctorData.rating}/5.0` : "4.8/5.0"}</h4><small style={{ color: '#a0c4ff' }}>Student Rating</small></div>
                <div className="text-end"><h4 className="mb-0 fw-bold">312</h4><small style={{ color: '#a0c4ff' }}>Students</small></div>
                <div className="text-end"><h4 className="mb-0 fw-bold">48</h4><small style={{ color: '#a0c4ff' }}>Lectures</small></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Active Lecture Bar */}
        <div className="d-flex flex-column flex-md-row-reverse justify-content-between align-items-center mb-4 p-3 px-4" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,245,255,0.7) 100%)', backdropFilter: 'blur(14px)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(43,58,85,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(43,58,85,0.12)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(43,58,85,0.08)'; }}>
          <div>
          <div className="mb-3 mb-md-0 text-center text-md-end">
      

            <div className="d-flex align-items-center justify-content-end gap-2 mb-1">
              <span style={{ background: 'linear-gradient(to right, #c4a16b, #e0c89c)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>LIVE NOW</span>
              <h4 style={{ color: '#2b3a55', fontWeight: 700, marginBottom: 0, fontSize: '1.3rem' }}>Mechatronics Systems <span style={{ fontWeight: 400, color: '#8899bb', fontSize: '1.05rem' }}>— Lecture 2</span></h4>
            </div>
            <div className="d-flex justify-content-end gap-3">
              <span style={{ color: '#888', fontSize: '0.9rem' }}><i className="bi bi-door-open me-1" style={{ color: '#c4a16b' }}></i>Room 301</span>
              <span style={{ color: '#888', fontSize: '0.9rem' }}><i className="bi bi-clock me-1" style={{ color: '#c4a16b' }}></i>10:00 am – 12:00 pm</span>
              <span style={{ color: '#888', fontSize: '0.9rem' }}><i className="bi bi-people me-1" style={{ color: '#c4a16b' }}></i>301 Students</span>
            </div>
          </div>
          <button style={{ background: 'linear-gradient(to right, #c4a16b, #e0c89c)', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(196, 161, 107, 0.4)', transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(196,161,107,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(196, 161, 107, 0.4)'; }}>
            <i className="bi bi-broadcast me-2"></i>Start Live Stream
          </button>
          </div>
          
        <div className="mt-4 p-3" style={{ background: 'rgba(232,237,242,0.6)', border: '1px dashed #b0c4de', borderRadius: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.3, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
                <div className="position-relative z-1">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                    <div className="d-flex align-items-center mb-2 mb-md-0">
                      <span style={{ fontWeight: 600, color: '#2b3a55', marginRight: '15px' }}>Upload File</span>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}><i className="bi bi-paperclip"></i> Excel, PDF, DOC. (files)</span>
                    </div>
                    <span className="badge" style={{ background: 'rgba(40, 167, 69, 0.8)', color: '#fff', fontWeight: 500, padding: '7px 12px', borderRadius: '20px' }}>
                      <i className="bi bi-cloud-arrow-up me-1"></i> +1 added file
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn w-50" style={{ background: 'linear-gradient(to right, #6b829c, #8ca3ba)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, padding: '10px', boxShadow: '0 4px 10px rgba(107,130,156,0.2)', transition: 'transform 0.25s, box-shadow 0.25s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(107,130,156,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(107,130,156,0.2)'; }} onClick={() => document.getElementById('gradesFile').click()}>
                      <i className="bi bi-cloud-upload me-2"></i>Upload File
                    </button>
                    <button className="btn w-50" style={{ background: 'linear-gradient(to right, #c4a16b, #e0c89c)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, padding: '10px', boxShadow: '0 4px 10px rgba(196,161,107,0.2)' }} onClick={() => setShowAssignmentModal(true)}>
                      <i className="bi bi-journal-text me-2"></i>Manage Assignments
                    </button>
                  </div>
                  <input type="file" id="gradesFile" accept=".xlsx,.pdf,.doc" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
              </div>
        </div>

        {/* 3. Main Split Section */}
        <div className="row g-4 mb-4">

          {/* Left Column: Today's Timeline */}
          <div className="col-lg-5">
            <div style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.4))', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '20px',
                color: 'white',
                backgroundImage: "url('/Pics/11.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'top',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(85, 110, 143, 0.8), rgba(212, 175, 55, 0.4))' }}></div>
                <h5 className="position-relative z-1" style={{ margin: 0, fontWeight: 600 }}>Today's Timeline</h5>
              </div>
              <div className="p-4 flex-grow-1">
                {/* Item 1 */}
                <div className="mb-3 d-flex justify-content-between align-items-center" style={{ transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div className="text-start" style={{ minWidth: '120px' }}>
                    <h6 style={{ color: '#c4a16b', fontWeight: 700, margin: 0 }}><i className="bi bi-clock me-1"></i> 10:00 AM</h6>
                    <small style={{ color: '#888' }}>To 12:00 PM</small>
                  </div>
                  <div className="d-flex align-items-start flex-row-reverse text-end">
                    <i className="bi bi-play-circle-fill ms-3 mt-1" style={{ color: '#28a745', fontSize: '1.2rem' }}></i>
                    <div>
                      <h6 style={{ color: '#2b3a55', fontWeight: 700, fontSize: '1.1rem', marginBottom: '2px' }}><span className="badge bg-success me-2" style={{ fontSize: '0.7rem' }}>Live</span> Mechatronics Systems</h6>
                      <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 0 }}>Mechatronics Eng. <span className="mx-1">•</span> 3rd Year <span className="mx-1">•</span> Room 301</p>
                    </div>
                  </div>
                </div>

                <hr style={{ opacity: 0.1, borderColor: '#000', margin: '15px 0' }} />

                {/* Item 2 */}
                <div className="mb-3 d-flex justify-content-between align-items-center" style={{ transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div className="text-start" style={{ minWidth: '120px' }}>
                    <h6 style={{ color: '#555', fontWeight: 600, margin: 0 }}><i className="bi bi-clock text-muted me-1"></i> 12:30 PM</h6>
                    <small style={{ color: '#888' }}>To 02:30 PM</small>
                  </div>
                  <div className="d-flex align-items-start flex-row-reverse text-end">
                    <i className="bi bi-calendar-event ms-3 mt-1" style={{ color: '#c4a16b', fontSize: '1.2rem' }}></i>
                    <div>
                      <h6 style={{ color: '#2b3a55', fontWeight: 700, fontSize: '1.1rem', marginBottom: '2px' }}>Control Theory</h6>
                      <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 0 }}>Systems Eng. <span className="mx-1">•</span> 3rd Year <span className="mx-1">•</span> Room 210</p>
                    </div>
                  </div>
                </div>

                <hr style={{ opacity: 0.1, borderColor: '#000', margin: '15px 0' }} />

                {/* Item 3 */}
                <div className="mb-0 d-flex justify-content-between align-items-center" style={{ transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div className="text-start" style={{ minWidth: '120px' }}>
                    <h6 style={{ color: '#555', fontWeight: 600, margin: 0 }}><i className="bi bi-clock text-muted me-1"></i> 03:00 PM</h6>
                    <small style={{ color: '#888' }}>To 05:00 PM</small>
                  </div>
                  <div className="d-flex align-items-start flex-row-reverse text-end">
                    <i className="bi bi-people ms-3 mt-1" style={{ color: '#c4a16b', fontSize: '1.2rem' }}></i>
                    <div>
                      <h6 style={{ color: '#2b3a55', fontWeight: 700, fontSize: '1.1rem', marginBottom: '2px' }}>Office Hours</h6>
                      <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 0 }}>Mechatronics Dept. <span className="mx-1">•</span> Room 401</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 border-top" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <button
                  className="btn w-100 position-relative border-0"
                  style={{ background: 'linear-gradient(to right, #2b3a55, #3a4f6d)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, padding: '10px', transition: '0.3s', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                  onClick={() => setShowWeeklyModal(true)}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.15, backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }}></div>
                  <span className="position-relative z-1"><i className="bi bi-calendar-week me-2"></i>View Full Week Schedule</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Doctor Information */}
          <div className="col-lg-7">
            <div className="p-4" style={{ 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 245, 255, 0.7) 100%)', 
              backdropFilter: 'blur(16px)', 
              borderRadius: '20px', 
              border: '1px solid rgba(255, 255, 255, 0.9)', 
              boxShadow: '0 15px 35px rgba(43, 58, 85, 0.08)',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Decorative backgrounds */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(196, 161, 107, 0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', bottom: '-80px', left: '-50px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(43, 58, 85, 0.08) 0%, transparent 70%)', borderRadius: '50%' }}></div>

              <div className="position-relative z-1 d-flex flex-column h-100">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(43,58,85,0.1)' }}>
                  <div className="d-flex align-items-center">
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #2b3a55, #3a4f6d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginRight: '15px', boxShadow: '0 4px 12px rgba(43,58,85,0.2)' }}>
                      <i className="bi bi-person-vcard fs-4"></i>
                    </div>
                    <div>
                      <h4 style={{ color: '#2b3a55', fontWeight: 800, margin: 0, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>About the Doctor</h4>
                      <p style={{ color: '#888', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>Professional Overview</p>
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'linear-gradient(to right, #c4a16b, #e0c89c)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(196,161,107,0.3)', letterSpacing: '0.5px' }}>{doctorData?.qualification || "Ph.D. Mechatronics"}</span>
                </div>

                <div className="row flex-grow-1 gy-4">
                  {/* Bio & Interests */}
                  <div className="col-md-7 d-flex flex-column">
                    <h6 style={{ color: '#2b3a55', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                      <i className="bi bi-quote me-2 fs-5" style={{ color: '#c4a16b' }}></i> Biography
                    </h6>
                    <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.7', flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.6)', padding: '15px 20px', borderRadius: '12px', borderLeft: '4px solid #c4a16b', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                      Associate Professor with 10+ years of experience in higher education and industrial robotics. Committed to bridging the gap between theoretical knowledge and practical application, focusing heavily on hands-on experiences. Lead researcher in the Auto-Robotics Lab.
                    </p>
                    
                    <h6 style={{ color: '#2b3a55', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '12px', marginTop: '15px', display: 'flex', alignItems: 'center' }}>
                      <i className="bi bi-lightbulb-fill me-2 text-warning fs-6"></i> Research Areas
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.9)', color: '#2b3a55', border: '1px solid rgba(43,58,85,0.15)', padding: '8px 12px', borderRadius: '8px', fontWeight: 600, transition: '0.2s', cursor: 'default', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} onMouseEnter={e => {e.currentTarget.style.background='#2b3a55'; e.currentTarget.style.color='white'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e => {e.currentTarget.style.background='rgba(255,255,255,0.9)'; e.currentTarget.style.color='#2b3a55'; e.currentTarget.style.transform='translateY(0)'}}>Robotics</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.9)', color: '#2b3a55', border: '1px solid rgba(43,58,85,0.15)', padding: '8px 12px', borderRadius: '8px', fontWeight: 600, transition: '0.2s', cursor: 'default', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} onMouseEnter={e => {e.currentTarget.style.background='#2b3a55'; e.currentTarget.style.color='white'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e => {e.currentTarget.style.background='rgba(255,255,255,0.9)'; e.currentTarget.style.color='#2b3a55'; e.currentTarget.style.transform='translateY(0)'}}>Control Theory</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.9)', color: '#2b3a55', border: '1px solid rgba(43,58,85,0.15)', padding: '8px 12px', borderRadius: '8px', fontWeight: 600, transition: '0.2s', cursor: 'default', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }} onMouseEnter={e => {e.currentTarget.style.background='#2b3a55'; e.currentTarget.style.color='white'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e => {e.currentTarget.style.background='rgba(255,255,255,0.9)'; e.currentTarget.style.color='#2b3a55'; e.currentTarget.style.transform='translateY(0)'}}>AI Systems</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="col-md-5">
                    <div className="p-4 h-100 d-flex flex-column" style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>                      
                      <div className="d-flex align-items-center mb-3" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(43,58,85,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2b3a55', marginRight: '15px' }}>
                          <i className="bi bi-envelope-at-fill fs-5"></i>
                        </div>
                        <div>
                          <small style={{ color: '#888', display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</small>
                          <span style={{ color: '#2b3a55', fontSize: '0.95rem', fontWeight: 700 }}>{doctorData?.email || "dr.sherif@evo.edu"}</span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-3" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(196,161,107,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4a16b', marginRight: '15px' }}>
                          <i className="bi bi-telephone-fill fs-5"></i>
                        </div>
                        <div>
                          <small style={{ color: '#888', display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Office Phone</small>
                          <span style={{ color: '#2b3a55', fontSize: '0.95rem', fontWeight: 700 }}>+1 (555) 123-4567</span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-4" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(40,167,69,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#28a745', marginRight: '15px' }}>
                          <i className="bi bi-building fs-5"></i>
                        </div>
                        <div>
                          <small style={{ color: '#888', display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</small>
                          <span style={{ color: '#2b3a55', fontSize: '0.95rem', fontWeight: 700 }}>{doctorData?.officelocation || "Building A, Rm 401"}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 border-top d-flex justify-content-center gap-3" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                        <button className="btn btn-sm" style={{ background: '#0077B5', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', boxShadow: '0 4px 10px rgba(0,119,181,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
                          <i className="bi bi-linkedin fs-6"></i>
                        </button>
                        <button className="btn btn-sm" style={{ background: '#1DA1F2', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', boxShadow: '0 4px 10px rgba(29,161,242,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
                          <i className="bi bi-twitter-x fs-6"></i>
                        </button>
                        <button className="btn btn-sm" style={{ background: '#333', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', boxShadow: '0 4px 10px rgba(51,51,51,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
                          <i className="bi bi-github fs-6"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Quick Actions */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="text-white position-relative" style={{ background: '#3a4f6d', overflow: 'hidden', cursor: 'pointer', borderRadius: '14px', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 6px 20px rgba(58,79,109,0.25)', transition: 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease' }} onClick={() => window.location.href = '/doctor/videos'} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-7px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(58,79,109,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(58,79,109,0.25)'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.2, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', transition: 'transform 0.5s ease', transform: 'scale(1)' }}></div>
              <div className="position-relative z-1 text-center" style={{ pointerEvents: 'none' }}>
                <i className="bi bi-camera-video mb-2" style={{ fontSize: '1.8rem', opacity: 0.85 }}></i>
                <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Videos</h4>
                <p className="mb-0" style={{ opacity: 0.75, fontSize: '0.95rem' }}>Manage Lectures</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-white position-relative" style={{ background: 'linear-gradient(135deg, #b8905a, #d4ab7a)', overflow: 'hidden', cursor: 'pointer', borderRadius: '14px', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 6px 20px rgba(196,161,107,0.3)', transition: 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease' }} onClick={() => window.location.href = '/doctor/assignments'} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-7px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(196,161,107,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(196,161,107,0.3)'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.12, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s ease', transform: 'scale(1)' }}></div>
              <div className="position-relative z-1 text-center" style={{ pointerEvents: 'none' }}>
                <i className="bi bi-clipboard-check mb-2" style={{ fontSize: '1.8rem', opacity: 0.85 }}></i>
                <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Assignments</h4>
                <p className="mb-0" style={{ opacity: 0.85, fontSize: '0.95rem' }}>Manage Tasks</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-white position-relative" style={{ background: 'linear-gradient(135deg, #7a94ae, #a0bcd4)', overflow: 'hidden', cursor: 'pointer', borderRadius: '14px', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 6px 20px rgba(140,163,186,0.3)', transition: 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease' }} onClick={() => window.location.href = '/doctor/grading'} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-7px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(140,163,186,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(140,163,186,0.3)'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.15, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', transition: 'transform 0.5s ease', transform: 'scale(1)' }}></div>
              <div className="position-relative z-1 text-center" style={{ pointerEvents: 'none' }}>
                <i className="bi bi-pencil-square mb-2" style={{ fontSize: '1.8rem', opacity: 0.85 }}></i>
                <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Grading</h4>
                <p className="mb-0" style={{ opacity: 0.85, fontSize: '0.95rem' }}>Grade Submissions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-white position-relative" style={{ background: 'linear-gradient(135deg, #2b3a55, #3a4f6d)', overflow: 'hidden', cursor: 'pointer', borderRadius: '14px', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 6px 20px rgba(43,58,85,0.25)', transition: 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease' }} onClick={() => window.location.href = '/doctor/student-grades'} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-7px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(43,58,85,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(43,58,85,0.25)'; }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.12, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s ease', transform: 'scale(1)' }}></div>
              <div className="position-relative z-1 text-center" style={{ pointerEvents: 'none' }}>
                <i className="bi bi-table mb-2" style={{ fontSize: '1.8rem', opacity: 0.85 }}></i>
                <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>Students Marks</h4>
                <p className="mb-0" style={{ opacity: 0.85, fontSize: '0.95rem' }}>Manage Grades</p>
              </div>
            </div>
          </div>
        </div >

        {/* 5. Main Upload Area */}
        < style dangerouslySetInnerHTML={{
          __html: `
          @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(196, 161, 107, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(196, 161, 107, 0); }
            100% { box-shadow: 0 0 0 0 rgba(196, 161, 107, 0); }
          }
          .upload-area-animated {
            animation: pulse-border 2.5s infinite;
          }
          .upload-area-animated:hover {
            animation: none;
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.08) !important;
          }
        `}
        } />

      </div >

      {/* Weekly Schedule Modal */}
      {
        showWeeklyModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#e8edf2', width: '90%', maxWidth: '950px', borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="d-flex justify-content-between align-items-center p-3 px-4" style={{ background: 'linear-gradient(to right, #2b3a55, #3a4f6d)', color: 'white' }}>
                <button
                  onClick={() => setShowWeeklyModal(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <i className="bi bi-arrow-left fs-5"></i>
                </button>
                <div className="d-flex align-items-center">
                  <h4 className="mb-0 fs-5 me-2" style={{ fontWeight: 600 }}>Full Weekly Schedule</h4>
                  <i className="bi bi-calendar3 text-white fs-5"></i>
                </div>
              </div>
              <div className="p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div className="table-responsive" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <table className="table table-hover align-middle mb-0 text-center">
                    <thead style={{ background: 'rgba(43, 58, 85, 0.05)', color: '#2b3a55', borderBottom: '2px solid #c4a16b' }}>
                      <tr>
                        <th className="p-3">Time</th>
                        <th className="p-3">Room</th>
                        <th className="p-3">Course</th>
                        <th className="p-3">Department & Year</th>
                        <th className="p-3">Day</th>
                      </tr>
                    </thead>
                    <tbody style={{ background: 'white' }}>
                      <tr>
                        <td><span style={{ color: '#c4a16b', fontWeight: 700 }}>10:00 AM - 12:00 PM</span></td>
                        <td><span style={{ color: '#2b3a55', fontWeight: 600 }}><i className="bi bi-geo-alt me-1 text-muted"></i> Room 301</span></td>
                        <td><span className="fw-bold" style={{ color: '#2b3a55', fontSize: '1.05rem' }}>Mechatronics Systems</span></td>
                        <td><span style={{ color: '#666' }}>Mechatronics Eng. • 3rd Year</span></td>
                        <td><span className="badge" style={{ background: '#2b3a55', padding: '8px 15px', fontSize: '0.9rem' }}>Sat</span></td>
                      </tr>
                      <tr>
                        <td><span style={{ color: '#c4a16b', fontWeight: 700 }}>12:30 PM - 02:30 PM</span></td>
                        <td><span style={{ color: '#2b3a55', fontWeight: 600 }}><i className="bi bi-geo-alt me-1 text-muted"></i> Room 210</span></td>
                        <td><span className="fw-bold" style={{ color: '#2b3a55', fontSize: '1.05rem' }}>Control Theory</span></td>
                        <td><span style={{ color: '#666' }}>Systems Eng. • 3rd Year</span></td>
                        <td><span className="badge" style={{ background: '#2b3a55', padding: '8px 15px', fontSize: '0.9rem' }}>Sat</span></td>
                      </tr>
                      <tr>
                        <td><span style={{ color: '#c4a16b', fontWeight: 700 }}>10:00 AM - 12:00 PM</span></td>
                        <td><span style={{ color: '#2b3a55', fontWeight: 600 }}><i className="bi bi-geo-alt me-1 text-muted"></i> Room 210</span></td>
                        <td><span className="fw-bold" style={{ color: '#2b3a55', fontSize: '1.05rem' }}>Data Science</span></td>
                        <td><span style={{ color: '#666' }}>Computer Eng. • 4th Year</span></td>
                        <td><span className="badge" style={{ background: '#2b3a55', padding: '8px 15px', fontSize: '0.9rem' }}>Sun</span></td>
                      </tr>
                      <tr>
                        <td><span style={{ color: '#c4a16b', fontWeight: 700 }}>12:00 PM - 02:00 PM</span></td>
                        <td><span style={{ color: '#2b3a55', fontWeight: 600 }}><i className="bi bi-geo-alt me-1 text-muted"></i> Room 401</span></td>
                        <td><span className="fw-bold" style={{ color: '#2b3a55', fontSize: '1.05rem' }}>AI Fundamentals</span></td>
                        <td><span style={{ color: '#666' }}>Computer Eng. • 4th Year</span></td>
                        <td><span className="badge" style={{ background: '#2b3a55', padding: '8px 15px', fontSize: '0.9rem' }}>Mon</span></td>
                      </tr>
                      <tr>
                        <td><span style={{ color: '#c4a16b', fontWeight: 700 }}>02:00 PM - 04:00 PM</span></td>
                        <td><span style={{ color: '#2b3a55', fontWeight: 600 }}><i className="bi bi-geo-alt me-1 text-muted"></i> Lab 3B</span></td>
                        <td><span className="fw-bold" style={{ color: '#2b3a55', fontSize: '1.05rem' }}>Robotics Lab</span></td>
                        <td><span style={{ color: '#666' }}>Mechatronics Eng. • 3rd Year</span></td>
                        <td><span className="badge" style={{ background: '#2b3a55', padding: '8px 15px', fontSize: '0.9rem' }}>Wed</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Expanded Photo Modal */}
      {isPhotoExpanded && (
        <div 
          onClick={() => setIsPhotoExpanded(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out',
            backdropFilter: 'blur(5px)'
          }}
        >
          <img
            src={doctorData?.photo || "/Pics/student.jpg"}
            alt="Doctor Enlarged"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: '85vh',
              maxWidth: '90vw',
              borderRadius: '20px',
              border: '4px solid #c19a6b',
              boxShadow: '0 0 40px rgba(193,154,107,0.5)',
              objectFit: 'contain',
              cursor: 'default',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          />
          <button 
            onClick={() => setIsPhotoExpanded(false)}
            style={{
              position: 'absolute',
              top: '25px',
              right: '35px',
              background: 'rgba(0,0,0,0.5)',
              border: '2px solid #c19a6b',
              color: '#fff',
              fontSize: '24px',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#c19a6b';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <CircularMenu />

      {showAssignmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowAssignmentModal(false)}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Manage Assignments</h4>
              <button className="btn-close" onClick={() => setShowAssignmentModal(false)}></button>
            </div>
            <hr/>
            <h5>Create New Assignment</h5>
            <form onSubmit={handleCreateAssignment}>
              <input className="form-control mb-2" placeholder="Course ID (e.g., CS101)" value={assignmentForm.course_id} onChange={e => setAssignmentForm({...assignmentForm, course_id: e.target.value})} required />
              <input className="form-control mb-2" placeholder="Title" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} required />
              <textarea className="form-control mb-2" placeholder="Details" value={assignmentForm.details} onChange={e => setAssignmentForm({...assignmentForm, details: e.target.value})}></textarea>
              <input className="form-control mb-2" placeholder="File Link (Google Form, etc.)" value={assignmentForm.file_url} onChange={e => setAssignmentForm({...assignmentForm, file_url: e.target.value})} required />
              <input className="form-control mb-2" placeholder="Image URL (optional)" value={assignmentForm.image_url} onChange={e => setAssignmentForm({...assignmentForm, image_url: e.target.value})} />
              <div className="d-flex gap-2 mb-2">
                <input type="datetime-local" className="form-control" value={assignmentForm.start_date} onChange={e => setAssignmentForm({...assignmentForm, start_date: e.target.value})} required />
                <input type="datetime-local" className="form-control" value={assignmentForm.end_date} onChange={e => setAssignmentForm({...assignmentForm, end_date: e.target.value})} required />
              </div>
              <input type="number" className="form-control mb-3" placeholder="Total Grade" value={assignmentForm.total_grade} onChange={e => setAssignmentForm({...assignmentForm, total_grade: e.target.value})} required />
              <button type="submit" className="btn btn-primary w-100">Dispatch Assignment</button>
            </form>
            
            <hr className="my-4"/>
            <h5>Student Submissions</h5>
            {submissions.length === 0 ? <p className="text-muted">No submissions yet.</p> : (
              <ul className="list-group">
                {submissions.map(sub => (
                  <li key={sub.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{sub.student_name}</strong> - {sub.title} ({sub.course_id})<br/>
                      <a href={sub.file_url} target="_blank" rel="noreferrer">View Submission</a>
                    </div>
                    <div>
                      {sub.status === 'graded' ? (
                        <span className="badge bg-success">Graded: {sub.grade}/{sub.total_grade}</span>
                      ) : (
                        <div className="d-flex">
                          <input type="number" id={`grade-${sub.id}`} className="form-control form-control-sm me-2" style={{ width: '70px' }} placeholder="Grade" />
                          <button className="btn btn-sm btn-success" onClick={() => handleGradeSubmission(sub.id, document.getElementById(`grade-${sub.id}`).value)}>Save</button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}