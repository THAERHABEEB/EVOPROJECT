import { useState, useEffect, useRef } from 'react'

export default function RoadmapComponent() {
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTerm, setCurrentTerm] = useState(3)
  const [terms, setTerms] = useState([])

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    try {
      // Try API call first
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
      if (userId) {
        try {
          const res = await (await import('@/lib/api')).api.studentsSpecialization.roadmap(userId)
          if (res?.status === 'success' && res.data) {
            const semestersFromApi = res.data.semesters.map(s => ({ id: s.semester, termName: `Semester ${s.semester}`, termNumber: s.semester, courses: [], completed: s.completed }))
            setTerms(semestersFromApi)
            setCurrentTerm(res.data.current_semester || 0)
            return
          }
        } catch (e) {
          console.warn('Roadmap API failed, falling back to static roadmap', e)
        }
      }
      setTerms([
        {
          id: 1,
          termName: 'Year 1 - Semester 1',
          termNumber: 1,
          year: '1',
          semester: '1',
          courses: [
            { id: 1, name: 'Introduction to Computer Science', code: 'CS101', credits: 3, status: 'completed', progress: 100 },
            { id: 2, name: 'Basic Programming', code: 'CS102', credits: 4, status: 'completed', progress: 100 },
            { id: 3, name: 'Advanced Mathematics 1', code: 'MATH101', credits: 3, status: 'completed', progress: 100 },
            { id: 4, name: 'Physics 1', code: 'PHYS101', credits: 3, status: 'completed', progress: 100 },
            { id: 5, name: 'Organic Chemistry', code: 'CHEM101', credits: 3, status: 'completed', progress: 100 },
            { id: 6, name: 'English 1', code: 'ENG101', credits: 2, status: 'completed', progress: 100 },
            { id: 7, name: 'Communication Skills', code: 'COMM101', credits: 2, status: 'completed', progress: 100 }
          ]
        },
        {
          id: 2,
          termName: 'Year 1 - Semester 2',
          termNumber: 2,
          year: '1',
          semester: '2',
          courses: [
            { id: 8, name: 'Object-Oriented Programming', code: 'CS201', credits: 4, status: 'completed', progress: 100 },
            { id: 9, name: 'Advanced Mathematics 2', code: 'MATH102', credits: 3, status: 'completed', progress: 100 },
            { id: 10, name: 'Physics 2', code: 'PHYS102', credits: 3, status: 'completed', progress: 100 },
            { id: 11, name: 'Database 1', code: 'DB101', credits: 3, status: 'completed', progress: 100 },
            { id: 12, name: 'Data Structures', code: 'CS202', credits: 3, status: 'completed', progress: 100 },
            { id: 13, name: 'English 2', code: 'ENG102', credits: 2, status: 'completed', progress: 100 },
            { id: 14, name: 'Web Development Basics', code: 'WEB101', credits: 2, status: 'completed', progress: 100 }
          ]
        },
        {
          id: 3,
          termName: 'Year 2 - Semester 1',
          termNumber: 3,
          year: '2',
          semester: '1',
          courses: [
            { id: 15, name: 'Data Science Fundamentals', code: 'DS101', credits: 4, status: 'in-progress', progress: 75 },
            { id: 16, name: 'Advanced Algorithms', code: 'CS301', credits: 3, status: 'in-progress', progress: 80 },
            { id: 17, name: 'Advanced Database', code: 'DB201', credits: 3, status: 'in-progress', progress: 70 },
            { id: 18, name: 'Web Application Development', code: 'WEB201', credits: 3, status: 'in-progress', progress: 85 },
            { id: 19, name: 'Artificial Intelligence - Introduction', code: 'AI101', credits: 3, status: 'in-progress', progress: 65 },
            { id: 20, name: 'Software Engineering', code: 'SE101', credits: 2, status: 'in-progress', progress: 72 },
            { id: 21, name: 'Cybersecurity Fundamentals', code: 'SEC101', credits: 2, status: 'in-progress', progress: 60 }
          ]
        },
        {
          id: 4,
          termName: 'Year 2 - Semester 2',
          termNumber: 4,
          year: '2',
          semester: '2',
          courses: [
            { id: 22, name: 'Advanced Machine Learning', code: 'ML201', credits: 4, status: 'pending', progress: 0 },
            { id: 23, name: 'Mobile Application Development', code: 'MOBILE101', credits: 3, status: 'pending', progress: 0 },
            { id: 24, name: 'Natural Language Processing', code: 'NLP101', credits: 3, status: 'pending', progress: 0 },
            { id: 25, name: 'Cloud Computing', code: 'CLOUD101', credits: 3, status: 'pending', progress: 0 },
            { id: 26, name: 'Big Data & Analytics', code: 'BD101', credits: 3, status: 'pending', progress: 0 },
            { id: 27, name: 'Data Security & Encryption', code: 'SEC201', credits: 2, status: 'pending', progress: 0 },
            { id: 28, name: 'Capstone Project - Part 1', code: 'CAPSTONE1', credits: 2, status: 'pending', progress: 0 }
          ]
        },
        {
          id: 5,
          termName: 'Year 3 - Semester 1',
          termNumber: 5,
          year: '3',
          semester: '1',
          courses: [
            { id: 29, name: 'Computer Vision', code: 'CV101', credits: 4, status: 'pending', progress: 0 },
            { id: 30, name: 'Deep Learning', code: 'DL101', credits: 3, status: 'pending', progress: 0 },
            { id: 31, name: 'Digital Image Processing', code: 'IP101', credits: 3, status: 'pending', progress: 0 },
            { id: 32, name: 'Research Methodology', code: 'RES101', credits: 3, status: 'pending', progress: 0 },
            { id: 33, name: 'AI Ethics', code: 'AI201', credits: 3, status: 'pending', progress: 0 },
            { id: 34, name: 'Machine Learning in Practice', code: 'ML301', credits: 2, status: 'pending', progress: 0 },
            { id: 35, name: 'Research Project 1', code: 'RESEARCH1', credits: 2, status: 'pending', progress: 0 }
          ]
        },
        {
          id: 6,
          termName: 'Year 3 - Semester 2',
          termNumber: 6,
          year: '3',
          semester: '2',
          courses: [
            { id: 36, name: 'Advanced Neural Networks', code: 'NN201', credits: 4, status: 'pending', progress: 0 },
            { id: 37, name: 'Big Data Analytics', code: 'BDA201', credits: 3, status: 'pending', progress: 0 },
            { id: 38, name: 'Real-World AI Applications', code: 'AI_APPS101', credits: 3, status: 'pending', progress: 0 },
            { id: 39, name: 'Scientific Computing', code: 'SC101', credits: 3, status: 'pending', progress: 0 },
            { id: 40, name: 'Data Warehousing', code: 'DW101', credits: 3, status: 'pending', progress: 0 },
            { id: 41, name: 'Software Project Management', code: 'PM101', credits: 2, status: 'pending', progress: 0 },
            { id: 42, name: 'Capstone Project - Part 2', code: 'CAPSTONE2', credits: 2, status: 'pending', progress: 0 }
          ]
        },
        {
          id: 7,
          termName: 'Year 4 - Semester 1',
          termNumber: 7,
          year: '4',
          semester: '1',
          courses: [
            { id: 43, name: 'Advanced Classification Techniques', code: 'ML401', credits: 4, status: 'pending', progress: 0 },
            { id: 44, name: 'Performance Optimization', code: 'OPT101', credits: 3, status: 'pending', progress: 0 },
            { id: 45, name: 'Distributed Computing', code: 'DC101', credits: 3, status: 'pending', progress: 0 },
            { id: 46, name: 'Intelligent Systems', code: 'SMART_SYS101', credits: 3, status: 'pending', progress: 0 },
            { id: 47, name: 'AI Applications in Healthcare', code: 'HEALTH_AI101', credits: 3, status: 'pending', progress: 0 },
            { id: 48, name: 'Scientific Seminars', code: 'SEMINAR1', credits: 2, status: 'pending', progress: 0 },
            { id: 49, name: 'Industry Internship', code: 'INTERNSHIP1', credits: 2, status: 'pending', progress: 0 }
          ]
        },
        {
          id: 8,
          termName: 'Year 4 - Semester 2',
          termNumber: 8,
          year: '4',
          semester: '2',
          courses: [
            { id: 50, name: 'Final Capstone Project', code: 'FINAL_PROJECT', credits: 5, status: 'pending', progress: 0 },
            { id: 51, name: 'Production Programming', code: 'PROD101', credits: 3, status: 'pending', progress: 0 },
            { id: 52, name: 'Advanced Research', code: 'RESEARCH_ADV', credits: 3, status: 'pending', progress: 0 },
            { id: 53, name: 'Commercial AI Applications', code: 'COMMERCIAL_AI', credits: 3, status: 'pending', progress: 0 },
            { id: 54, name: 'AI Ethics & Law', code: 'AI_ETHICS', credits: 2, status: 'pending', progress: 0 },
            { id: 55, name: 'Advanced Industry Practice', code: 'INTERNSHIP2', credits: 2, status: 'pending', progress: 0 },
            { id: 56, name: 'Specialized Scientific Seminars', code: 'SEMINAR2', credits: 2, status: 'pending', progress: 0 }
          ]
        }
      ])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'completed': '#4CAF50',
      'in-progress': '#2196F3',
      'pending': '#757575'
    }
    return colors[status] || '#999'
  }

  const getStatusText = (status) => {
    const texts = {
      'completed': 'Completed',
      'in-progress': 'In Progress',
      'pending': 'Coming Soon'
    }
    return texts[status] || status
  }

  const row1 = [
    ...(terms.slice(-8, 4) || []).sort((a, b) => b.termNumber - a.termNumber),
    { isSpecial: true, id: 'start', termName: 'START', status: 'completed', icon: '🚀' }  
  ]
  
  const row2 = [
    { isSpecial: true, id: 'finish', termName: 'FINISH', status: 'pending', icon: '🎓' },
    ...(terms.slice(4, 8) || []).sort((a, b) => b.termNumber - a.termNumber),
  ]

  const renderNode = (node) => {
    const isExpanded = selectedTerm === node.id
    const isSpecial = node.isSpecial

    let progressPercentage = 0
    let completedCourses = 0
    let nodeColor = '#555'

    if (isSpecial) {
      nodeColor = node.id === 'start' ? '#ff9800' : '#f44336'
    } else if (node.courses && node.courses.length > 0) {
      completedCourses = node.courses.filter(c => c.status === 'completed').length
      progressPercentage = Math.round((completedCourses / node.courses.length) * 100)
      nodeColor = getStatusColor(node.courses[0].status)
    }

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '90px' }}>
        
        {/* Circle Button */}
        <button 
          onClick={() => !isSpecial && setSelectedTerm(selectedTerm === node.id ? null : node.id)}
          style={{
            width: '70px', height: '70px', borderRadius: '50%',
            backgroundColor: '#1a1a2e',
            border: `4px solid ${nodeColor}`,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: isSpecial ? 'default' : 'pointer', zIndex: 2,
            position: 'relative',
            padding: 0,
            transition: 'transform 0.2s',
            transform: isExpanded ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          {isSpecial ? (
            <span style={{ fontSize: '28px' }}>{node.icon}</span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>
                {progressPercentage}%
              </span>
            </div>
          )}

          {/* Current Term Avatar */}
          {node.termNumber === currentTerm && (
            <div style={{
              position: 'absolute', top: '-15px', right: '-15px',
              fontSize: '24px', animation: 'bounce 2s infinite', zIndex: 3
            }}>
              👨‍🎓
            </div>
          )}
        </button>

        {/* Label */}
        <div style={{ 
          marginTop: '12px', height: '40px', fontSize: '12px', 
          fontWeight: 'bold', color: '#e0e0e0', textAlign: 'center',
          lineHeight: '1.3'
        }}>
          {node.termName}
        </div>

        {/* Dropdown for regular terms */}
        {!isSpecial && isExpanded && (
          <div 
            className="hide-dropdown-scrollbar"
            style={{
              position: 'absolute', top: '85px', left: '50%', transform: 'translateX(-50%)',
              width: '320px', backgroundColor: '#1a1a2e', border: `1px solid ${nodeColor}`,
              padding: '15px', borderRadius: '8px', zIndex: 100,
              maxHeight: '350px', overflowY: 'auto',
              animation: 'slideDown 0.3s ease',
              boxShadow: `0 10px 30px rgba(0,0,0,0.6)`
            }}
          >
            <style>{`
              .hide-dropdown-scrollbar::-webkit-scrollbar {
                display: none;
              }
              @keyframes slideDown {
                from { opacity: 0; transform: translate(-50%, -10px); }
                to { opacity: 1; transform: translate(-50%, 0); }
              }
            `}</style>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: nodeColor, fontSize: '14px' }}>{node.termName} Courses:</strong>
            </div>

            {node.courses.map((course) => (
              <div key={course.id} style={{
                marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #333', fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', gap: '5px' }}>
                  <div style={{ flex: 1 }}>
                    <h6 style={{ color: getStatusColor(course.status), marginBottom: '2px', fontSize: '11px', fontWeight: 'bold' }}>
                      {course.name}
                    </h6>
                    <small style={{ color: '#999', fontSize: '10px' }}>
                      {course.code}
                    </small>
                  </div>
                  <span style={{
                    backgroundColor: getStatusColor(course.status), color: '#000',
                    padding: '2px 6px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap',
                    height: 'fit-content'
                  }}>
                    {getStatusText(course.status)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '4px', backgroundColor: '#333', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
                  <div style={{
                    height: '100%', backgroundColor: getStatusColor(course.status), width: `${course.progress}%`, transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
            ))}

            {/* Term Summary */}
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#2a2a4e', borderRadius: '6px', fontSize: '11px' }}>
              <strong style={{ color: '#fff' }}>Summary:</strong>
              <div style={{ marginTop: '6px', color: '#ccc', display: 'flex', justifyContent: 'space-between' }}>
                <span>Credit Hours: {node.courses.reduce((sum, c) => sum + c.credits, 0)}</span>
                <span>Completed: {completedCourses}/{node.courses.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading roadmap...</div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto',height: '100%', overflowY: 'auto', paddingBottom: '40px' }} className="hide-scrollbar">
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
          <div style={{ minWidth: '850px', maxWidth: '1000px', margin: '0 auto', position: 'relative', overflow: 'visible', paddingTop: '20px' }}>
            
            {/* The 3 track lines */}
            <div style={{ position: 'absolute', top: '27px', left: '10%', right: '14%', height: '16px', background: '#444', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '137px', left: '14%', right: '14%', height: '16px', background: '#444', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '247px', left: '14%', right: '10%', height: '16px', background: '#444', zIndex: 0 }} />

            {/* Right Loop */}
            <div style={{ 
              position: 'absolute', top: '27px', right: '6%', width: '10%', height: '126px', 
              borderRight: '16px solid #444', borderTop: '16px solid #444', borderBottom: '16px solid #444', 
              borderTopRightRadius: '63px', borderBottomRightRadius: '63px', boxSizing: 'border-box', zIndex: 0
            }} />
            {/* Left Loop */}
            <div style={{ 
              position: 'absolute', top: '137px', left: '6%', width: '10%', height: '126px', 
              borderLeft: '16px solid #444', borderTop: '16px solid #444', borderBottom: '16px solid #444', 
              borderTopLeftRadius: '63px', borderBottomLeftRadius: '63px', boxSizing: 'border-box', zIndex: 0
            }} />

            {/* Nodes Container */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* ROW 1 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8%', position: 'relative' }}>
                {row1.map(node => renderNode(node))}
              </div>

              {/* SPACER for Middle Track (Row 1 height is ~120px with text, center to center distance is 220px. 100px spacer) */}
              <div style={{ height: '100px' }} />

              {/* ROW 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8%', position: 'relative' }}>
                {row2.map(node => renderNode(node))}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
