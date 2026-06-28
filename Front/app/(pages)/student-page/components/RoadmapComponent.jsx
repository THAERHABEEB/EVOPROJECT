import { useState, useEffect, useRef } from 'react'

import { api } from '@/lib/api'

export default function RoadmapComponent({ studentId }) {
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTerm, setCurrentTerm] = useState(1)
  const [terms, setTerms] = useState([])

  useEffect(() => {
    if (studentId) {
      fetchRoadmap()
    }
  }, [studentId])

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      const res = await api.students.getRoadmap(studentId)
      if (res.status === 'success') {
        const progressMap = res.course_progress || {};

        const formattedTerms = res.data.map((plan, index) => {
          const coursesData = typeof plan.model === 'string' ? JSON.parse(plan.model) : plan.model;
          const termStatus = plan.term_status || 'future';

          const trackedCourses = coursesData.map(c => {
            const tracking = progressMap[c.name] || { progress: 0, status: 'pending' };
            let status = tracking.status;
            let progress = tracking.progress;

            if (termStatus === 'future') {
              status = 'pending';
              progress = 0;
            } else if (termStatus === 'past' && status === 'pending') {
              status = 'completed';
              progress = 100;
            }

            return {
              id: c.id,
              name: c.name,
              code: c.id,
              credits: 3,
              status,
              progress
            };
          });

          return {
            id: plan.id,
            termName: plan.year_name,
            termNumber: plan.term_number || index + 1,
            termStatus,
            courses: trackedCourses
          };
        });
        setTerms(formattedTerms);
        setCurrentTerm(res.current_term_number || 1);
      }
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
    ...(terms.slice(0, 4) || []).sort((a, b) => b.termNumber - a.termNumber),
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
    } else if (node.termStatus === 'current') {
      nodeColor = '#d29505'
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
        <div style={{ width: '100%', overflowX: 'auto', height: '100%', overflowY: 'auto', paddingBottom: '40px' }} className="hide-scrollbar roadmap-scroll">
          <p className="roadmap-scroll-hint">← Swipe to explore your roadmap →</p>
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
          <div className="roadmap-inner" style={{ minWidth: '850px', maxWidth: '1000px', margin: '0 auto', position: 'relative', overflow: 'visible', paddingTop: '20px' }}>

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
