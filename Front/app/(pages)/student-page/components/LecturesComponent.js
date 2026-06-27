import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LiveDotIcon } from '@/app/components/Icons'
import { api } from '@/lib/api'

/* ─── shared dropdown style ─────────────────────────────────────────────── */
const selectStyle = {
  padding: '11px 36px 11px 14px',
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(10px)',
  border: '1px solid #6fc3ff',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  appearance: 'none',
  WebkitAppearance: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
}

/* Chevron SVG for dropdowns */
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#c19a6b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

/* Play-button thumbnail */
const VideoThumbnail = ({ week }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1a1a3e 0%, #2a2a5e 100%)',
    borderRadius: '8px',
    height: '110px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* glow ring */}
    <div style={{
      width: '52px', height: '52px', borderRadius: '50%',
      background: 'rgba(193,154,107,0.15)',
      border: '2px solid rgba(193,154,107,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#c19a6b">
        <polygon points="5,3 19,12 5,21"/>
      </svg>
    </div>
    {week && (
      <span style={{
        position: 'absolute', top: '8px', left: '8px',
        background: 'rgba(111,195,255,0.18)',
        border: '1px solid #6fc3ff',
        color: '#6fc3ff', fontSize: '10px', fontWeight: 700,
        borderRadius: '4px', padding: '2px 7px', letterSpacing: '0.5px',
      }}>
        {week}
      </span>
    )}
  </div>
)

export default function LecturesComponent() {
  const [liveLectures, setLiveLectures]       = useState([])
  const [recordedLectures, setRecordedLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery]         = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [selectedWeek, setSelectedWeek]       = useState('All')
  const router = useRouter()

  useEffect(() => {
    fetchLectures()
  }, [])

  const fetchLectures = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
      if (studentId) {
        const res = await api.lectures.getByStudentId(studentId);
        if (res.status === 'success' && res.data) {
           const live = [];
           const recorded = [];
           res.data.forEach(item => {
             const lectureObj = {
               id: item.id,
               title: item.name || 'Untitled Lecture',
               instructor: item.doctor_name || `Dr. #${item.doctor_id || ''}`,
               subject: item.course_name || 'General',
               time: item.start_time || '10:00 AM',
               uploadDate: item.start_time ? new Date(item.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
               duration: item.duration || '1h 30m',
               week: `Week ${item.week || 1}`,
               image: 'Pics/2.jpg',
               liveUrl: item.live_url
             };
             if (item.status === 'live') live.push(lectureObj);
             else recorded.push(lectureObj);
           });
           setLiveLectures(live);
           setRecordedLectures(recorded);
        }
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnterLecture   = (id) => router.push(`/student-page/live-lecture/${id}`)
  const handleWatchRecorded  = (id) => alert(`Playing recorded lecture ${id}`)

  /* ── derived filter options ── */
  const subjects = ['All', ...new Set(recordedLectures.map(l => l.subject))]
  const weeks    = ['All', ...new Set(recordedLectures.map(l => l.week)).values()].sort()

  /* ── filtered list ── */
  const filtered = recordedLectures.filter(l => {
    const q = searchQuery.toLowerCase()
    const matchSearch  = !q || l.title.toLowerCase().includes(q) || l.instructor.toLowerCase().includes(q)
    const matchSubject = selectedSubject === 'All' || l.subject === selectedSubject
    const matchWeek    = selectedWeek    === 'All' || l.week    === selectedWeek
    return matchSearch && matchSubject && matchWeek
  })

  const hasActiveFilter = searchQuery || selectedSubject !== 'All' || selectedWeek !== 'All'

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading lectures...</div>
      ) : (
        <>
          {/* ══════════ Live Lectures ══════════ */}
          <h2 style={{ color: '#6fc3ff', fontWeight: 'bold' }} className="mb-4">Live Lectures Now</h2>
          <div className="row g-4 mb-5">
            {liveLectures.map((lecture) => (
              <div key={lecture.id} className="col-lg-6">
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #6fc3ff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    backgroundColor: '#ff6b6b', color: 'white',
                    padding: '5px 10px', borderRadius: '5px', zIndex: 10,
                  }}>
                    <LiveDotIcon size={12} style={{ marginRight: '6px' }} /> Live Now
                  </div>
                  <img src={lecture.image} className="w-100" style={{ height: '280px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src="Pics/logo.png" width="60" style={{ borderRadius: '50%', border: '2px solid #6fc3ff' }} />
                      <div>
                        <h5 style={{ marginBottom: 0, color: '#6fc3ff' }}>{lecture.title}</h5>
                        <small style={{ color: '#ccc' }}>{lecture.instructor}</small>
                      </div>
                    </div>
                    <button
                      className="mt-3 w-100"
                      onClick={() => handleEnterLecture(lecture.id)}
                      style={{
                        backgroundColor: '#c19a6b',
                        border: '1px solid #6fc3ff',
                        borderRadius: '8px',
                        padding: '15px',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Enter Lecture
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════ Recorded Lectures ══════════ */}
          <h2 style={{ color: '#6fc3ff', fontWeight: 'bold' }} className="mt-5 mb-4">Recorded Lectures</h2>

          {/* ── Filter Toolbar ── */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(111,195,255,0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
          }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>

              {/* Search Input */}
              <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  color: '#c19a6b', pointerEvents: 'none', lineHeight: 1,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search lecture or instructor…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    ...selectStyle,
                    padding: '11px 14px 11px 38px',
                  }}
                  onFocus={(e)  => e.target.style.borderColor = '#c19a6b'}
                  onBlur={(e)   => e.target.style.borderColor = '#6fc3ff'}
                />
              </div>

              {/* Subject Dropdown */}
              <div style={{ position: 'relative', flex: '1 1 160px', minWidth: '140px' }}>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={selectStyle}
                  onFocus={(e) => e.target.style.borderColor = '#c19a6b'}
                  onBlur={(e)  => e.target.style.borderColor = '#6fc3ff'}
                >
                  {subjects.map(s => <option key={s} value={s} style={{ background: '#1a1a3e' }}>{s === 'All' ? '📚 All Subjects' : s}</option>)}
                </select>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <ChevronIcon />
                </span>
              </div>

              {/* Week Dropdown */}
              <div style={{ position: 'relative', flex: '1 1 140px', minWidth: '120px' }}>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  style={selectStyle}
                  onFocus={(e) => e.target.style.borderColor = '#c19a6b'}
                  onBlur={(e)  => e.target.style.borderColor = '#6fc3ff'}
                >
                  {weeks.map(w => <option key={w} value={w} style={{ background: '#1a1a3e' }}>{w === 'All' ? '🗓️ All Weeks' : w}</option>)}
                </select>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <ChevronIcon />
                </span>
              </div>

              {/* Clear button — shown only when a filter is active */}
              {hasActiveFilter && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedSubject('All'); setSelectedWeek('All') }}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: '1px solid rgba(255,100,100,0.5)',
                    borderRadius: '8px',
                    color: '#ff8888',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'rgba(255,100,100,0.12)'; e.target.style.borderColor = '#ff6666' }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,100,100,0.5)' }}
                >
                  ✕ Clear filters
                </button>
              )}
            </div>

            {/* Results count */}
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              Showing <span style={{ color: '#6fc3ff', fontWeight: 600 }}>{filtered.length}</span> of {recordedLectures.length} lectures
            </div>
          </div>

          {/* ── Lecture Cards ── */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '50px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(111,195,255,0.2)',
              borderRadius: '12px', color: '#666',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '15px' }}>No lectures match your filters</div>
              <div style={{ fontSize: '13px', marginTop: '6px', color: '#555' }}>Try adjusting the search or dropdowns above</div>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((lecture) => (
                <div key={lecture.id} className="col-md-4">
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(111,195,255,0.3)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    padding: '16px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c19a6b'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(111,195,255,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <VideoThumbnail week={lecture.week} />

                    <div style={{ flex: 1 }}>
                      <h6 style={{ color: '#6fc3ff', marginBottom: '6px', lineHeight: 1.4 }}>{lecture.title}</h6>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{
                          background: 'rgba(193,154,107,0.15)',
                          border: '1px solid rgba(193,154,107,0.4)',
                          color: '#c19a6b', fontSize: '10px', fontWeight: 600,
                          borderRadius: '4px', padding: '2px 7px',
                        }}>
                          {lecture.subject}
                        </span>
                      </div>
                      <small style={{ color: '#bbb', display: 'block', marginBottom: '6px' }}>
                        {lecture.instructor}
                      </small>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        ⏱ {lecture.duration} &nbsp;·&nbsp; 📅 {lecture.uploadDate}
                      </div>
                    </div>

                    <button
                      onClick={() => handleWatchRecorded(lecture.id)}
                      style={{
                        marginTop: '14px',
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(111,195,255,0.08)',
                        border: '1px solid #6fc3ff',
                        borderRadius: '8px',
                        color: '#6fc3ff',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.target.style.background = 'rgba(111,195,255,0.18)'; e.target.style.color = '#fff' }}
                      onMouseLeave={(e) => { e.target.style.background = 'rgba(111,195,255,0.08)'; e.target.style.color = '#6fc3ff' }}
                    >
                      ▶ Watch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
