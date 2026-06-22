'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import { api } from '@/lib/api'

export default function StudentGradesPage() {
  const [doctorData, setDoctorData] = useState(null)
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [courseStatus, setCourseStatus] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        let userId = localStorage.getItem('userId')
        const token = localStorage.getItem('token')
        
        if (!userId && token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            userId = payload.id
            if (userId) localStorage.setItem('userId', userId)
          } catch (e) { console.error('Error decoding token:', e) }
        }

        if (!userId) {
          console.error('No userId found')
          setLoading(false)
          return
        }

        // 1. Get doctor record
        const drRes = await api.doctors.getAll({ user_id: userId })
        if (drRes.status === 'success' && drRes.data.length > 0) {
          const dr = drRes.data[0]
          setDoctorData(dr)
          
          // 2. Get courses for this doctor
          const coursesRes = await api.doctors.getCourses(dr.id)
          if (coursesRes.status === 'success') {
            setCourses(coursesRes.data)
            if (coursesRes.data.length > 0) {
              setSelectedCourseId(coursesRes.data[0].id)
            }
          }
        }
      } catch (error) {
        console.error('Error initializing page:', error)
      } finally {
        setLoading(false)
      }
    }

    init()

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

  useEffect(() => {
    if (selectedCourseId) {
      const fetchStudents = async () => {
        try {
          const res = await api.courses.getStudents(selectedCourseId)
          if (res.status === 'success') {
            // Map the data to our state structure
            const mapped = res.data.map(s => ({
              id: s.id,
              name: s.name,
              department: s.department,
              year: s.year_level,
              mid_grades: s.mid_grades || '',
              final_grades: s.final_grades || '',
              sup_grades: s.sup_grades || '',
              letter_grades: s.letter_grades || ''
            }))
            setStudents(mapped)
          }
        } catch (error) {
          console.error('Error fetching students:', error)
        }

        try {
          const uploadRes = await api.uploadGrades.getAll({ course_id: selectedCourseId })
          if (uploadRes.status === 'success' && uploadRes.data && uploadRes.data.length > 0) {
            setCourseStatus(uploadRes.data[0].status)
          } else {
            setCourseStatus(null)
          }
        } catch (error) {
          console.error('Error fetching upload status:', error)
          setCourseStatus(null)
        }
      }
      fetchStudents()
    }
  }, [selectedCourseId])

  const filteredStudents = students.filter(s => 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(s.id).includes(searchTerm))
  )

  const getLetterGrade = (percentage) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  const handleGradeChange = (id, field, value) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      
      const newStudent = { ...s, [field]: value };
      
      // Auto-calculate letter grade if grade fields change
      if (['mid_grades', 'final_grades', 'sup_grades'].includes(field)) {
        const mid = parseFloat(newStudent.mid_grades) || 0;
        const final = parseFloat(newStudent.final_grades) || 0;
        const sup = parseFloat(newStudent.sup_grades) || 0;
        
        const selectedCourse = courses.find(c => c.id === selectedCourseId) || {};
        const totalGrade = selectedCourse.total_grade ? parseFloat(selectedCourse.total_grade) : 150;
        
        if (newStudent.mid_grades !== '' || newStudent.final_grades !== '' || newStudent.sup_grades !== '') {
          const totalScore = mid + final + sup;
          const percentage = (totalScore / totalGrade) * 100;
          newStudent.letter_grades = getLetterGrade(percentage);
        } else {
           newStudent.letter_grades = '';
        }
      }
      
      return newStudent;
    }))
  }

  const handleSaveAllMarks = async () => {
    if (!selectedCourseId || !doctorData) return
    
    setSubmitting(true)
    setMessage({ type: '', text: '' })
    
    try {
      const payload = {
        course_id: selectedCourseId,
        doctor_id: doctorData.id,
        grades: students.map(s => ({
          id: s.id,
          name: s.name,
          mid_grades: s.mid_grades,
          final_grades: s.final_grades,
          sup_grades: s.sup_grades,
          letter_grades: s.letter_grades
        }))
      }
      
      const res = await api.uploadGrades.submit(payload)
      if (res.status === 'success') {
        setMessage({ type: 'success', text: 'Grades saved successfully and pending approval.' })
      }
    } catch (error) {
      console.error('Error saving grades:', error)
      setMessage({ type: 'error', text: 'Failed to save grades. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ color: '#2b3a55', textAlign: 'center', marginTop: '100px', fontSize: '1.5rem', fontWeight: 700 }}>Loading Grade Manager...</div>

  return (
    <>
      <div id="cursor-glow"></div>
      <Header title="Student Grades Manager" />

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '100px 20px 40px',
        fontFamily: "'Outfit', sans-serif"
      }}>

        <div style={{
          width: '100%',
          maxWidth: '1200px',
          padding: '40px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(to right, #c4a16b, #e0c89c)' }}></div>

          <div className="text-center text-md-start mb-5 d-flex justify-content-between align-items-end">
            <div>
              <h1 style={{ color: '#2b3a55', fontWeight: 800, margin: 0, fontSize: '2.2rem' }}>📊 Student Grades</h1>
              <p style={{ color: '#666', margin: '5px 0 0', fontWeight: 500 }}>Logged in as: <span style={{ color: '#c4a16b', fontWeight: 700 }}>{doctorData?.name}</span></p>
            </div>
            {message.text && (
              <div style={{ 
                padding: '10px 20px', 
                borderRadius: '8px', 
                background: message.type === 'success' ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
                color: message.type === 'success' ? '#28a745' : '#dc3545',
                fontWeight: 600,
                border: `1px solid ${message.type === 'success' ? '#28a745' : '#dc3545'}`
              }}>
                {message.text}
              </div>
            )}
          </div>

          <div className="row g-3 mb-4">
             <div className="col-md-6">
                <label style={labelStyle}>Select Subject / Course</label>
                <select 
                  value={selectedCourseId} 
                  onChange={e => setSelectedCourseId(e.target.value)} 
                  style={selectStyle}
                >
                  {courses.length > 0 ? (
                    courses.map(c => <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>)
                  ) : (
                    <option disabled>No courses assigned</option>
                  )}
                </select>
             </div>
             <div className="col-md-6 d-flex flex-column justify-content-end">
                <label style={labelStyle}>Search Students</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4a16b', fontSize: '0.9rem' }}></i>
                  <input 
                    type="text" 
                    placeholder="Search by ID or Name..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ ...selectStyle, paddingLeft: '35px' }}
                  />
                </div>
             </div>
          </div>

          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            background: 'white'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#2b3a55', color: 'white' }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Student Name</th>
                    <th style={thStyle}>Dept.</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Mid Grades</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Final Grades</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Sup Grades</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Letter Grades</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} style={{ 
                      background: idx % 2 === 0 ? 'white' : 'rgba(196,161,107,0.03)',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      transition: 'background 0.2s'
                    }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,161,107,0.08)'} onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : 'rgba(196,161,107,0.03)'}>
                      <td style={tdStyle}>{student.id}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#2b3a55' }}>{student.name}</td>
                      <td style={tdStyle}>{student.department}</td>
                      
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <input 
                          type="number" 
                          value={student.mid_grades} 
                          onChange={e => handleGradeChange(student.id, 'mid_grades', e.target.value)}
                          style={gradeInputStyle}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <input 
                          type="number" 
                          value={student.final_grades} 
                          onChange={e => handleGradeChange(student.id, 'final_grades', e.target.value)}
                          style={gradeInputStyle}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <input 
                          type="number" 
                          value={student.sup_grades} 
                          onChange={e => handleGradeChange(student.id, 'sup_grades', e.target.value)}
                          style={gradeInputStyle}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#c4a16b', fontSize: '1.2rem' }}>
                          {student.letter_grades || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                        {courses.length === 0 ? 'No courses assigned to you.' : 'No students found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div>
              {courseStatus && (
                <div style={{ color: courseStatus === 'Pending' ? '#f39c12' : (courseStatus === 'Approved' ? '#28a745' : '#c0392b'), fontWeight: 600, fontSize: '0.95rem' }}>
                  <i className="bi bi-info-circle me-1"></i>
                  Current Status: {courseStatus} 
                  {courseStatus === 'Pending' && " (Saving will update the pending file)"}
                  {courseStatus === 'Approved' && " (Saving will request a new review)"}
                </div>
              )}
            </div>
            <button 
              className="btn" 
              onClick={handleSaveAllMarks}
              disabled={submitting || courses.length === 0 || students.length === 0}
              style={{ 
                background: 'linear-gradient(to right, #2b3a55, #3a4f6d)', 
                color: 'white', 
                padding: '12px 35px', 
                borderRadius: '10px', 
                fontWeight: 700,
                boxShadow: '0 6px 20px rgba(43,58,85,0.2)',
                opacity: (submitting || courses.length === 0 || students.length === 0) ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              <i className={`bi ${submitting ? 'bi-hourglass-split' : 'bi-cloud-check'} me-2`}></i> 
              {submitting ? 'Saving...' : 'Save All Marks'}
            </button>
          </div>
        </div>

      </div>

      <CircularMenu />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </>
  )
}

const thStyle = { padding: '15px 20px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }
const tdStyle = { padding: '15px 20px', fontSize: '1rem', color: '#555' }
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#2b3a55', textTransform: 'uppercase', letterSpacing: '0.5px' }
const selectStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(196,161,107,0.3)',
  background: 'rgba(255,255,255,0.9)',
  outline: 'none',
  fontSize: '0.9rem',
  color: '#2b3a55',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease'
}
const gradeInputStyle = {
  width: '70px',
  border: '1px solid #eee',
  borderRadius: '6px',
  padding: '5px',
  textAlign: 'center',
  fontWeight: 600,
  background: 'transparent',
  transition: 'all 0.2s'
}
