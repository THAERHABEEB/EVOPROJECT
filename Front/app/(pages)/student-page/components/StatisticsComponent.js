'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  Area, AreaChart
} from 'recharts'
import { api } from '@/lib/api'

export default function StatisticsComponent({ studentId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (studentId) {
      fetchStatistics()
    } else {
      setLoading(false)
      setError('Student ID is missing. Please refresh the page.')
    }
  }, [studentId])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.statistics.getByStudentId(studentId)
      if (res.status === 'success') {
        setStats(res.data)
      } else {
        setError('Failed to fetch statistics data.')
      }
    } catch (err) {
      console.error('Error fetching statistics:', err)
      setError('An error occurred while loading statistics.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? (
        <div className="alert alert-info" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #6fc3ff' }}>Loading statistics...</div>
      ) : error ? (
        <div className="alert alert-danger" style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' }}>{error}</div>
      ) : stats ? (
        <>
          <h2 style={{color: '#6fc3ff', fontWeight: 'bold'}} className="mb-4">Academic Performance Statistics</h2>
          
          {/* Key Metrics Dashboard */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(111,195,255,0.3)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={{color: '#6fc3ff', fontSize: '2.8rem', fontWeight: 'bold', margin: '0 0 10px 0'}}>{stats.gpa}</h3>
                <p style={{color: '#ccc', marginBottom: '0', fontSize: '1.1rem', fontWeight: 500}}>Cumulative GPA</p>
              </div>
            </div>

            <div className="col-md-4">
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(196,161,107,0.3)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={{color: '#c4a16b', fontSize: '2.8rem', fontWeight: 'bold', margin: '0 0 10px 0'}}>{stats.averageGrade}%</h3>
                <p style={{color: '#ccc', marginBottom: '0', fontSize: '1.1rem', fontWeight: 500}}>Average Grade</p>
              </div>
            </div>

            <div className="col-md-4">
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={{color: '#ff6b6b', fontSize: '2.8rem', fontWeight: 'bold', margin: '0 0 10px 0'}}>{stats.ranking}</h3>
                <p style={{color: '#ccc', marginBottom: '0', fontSize: '1.1rem', fontWeight: 500}}>Class Ranking</p>
              </div>
            </div>
          </div>

          {/* Row 1: Bar Chart (Attendance) & Pie Chart (Assignment Status) */}
          <div className="row g-4 mb-5">
            <div className="col-lg-8">
              <div className="p-4 h-100 position-relative text-white" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'}>
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}>Weekly Attendance Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(10,20,40,0.9)', border: '1px solid rgba(111,195,255,0.5)', borderRadius: '8px', color: '#fff' }} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Bar dataKey="present" fill="#6fc3ff" radius={[6, 6, 0, 0]} name="Present (Lectures)" />
                    <Bar dataKey="absent" fill="#ff6b6b" radius={[6, 6, 0, 0]} name="Absent (Lectures)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="p-4 h-100 position-relative text-white" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'}>
                <h4 className="mb-4 text-center" style={{ color: '#fff', fontWeight: 600 }}>Assignment Status</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={stats.assignmentStatus} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                      {stats.assignmentStatus.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(10,20,40,0.9)', border: '1px solid rgba(111,195,255,0.5)', borderRadius: '8px', color: '#fff' }} />
                    <Legend wrapperStyle={{ color: '#fff' }} verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Area Chart (GPA Trend) & Line Chart (Activity) */}
          <div className="row g-4 mb-5">
            <div className="col-lg-6">
              <div className="p-4 h-100 position-relative text-white" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'}>
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}>GPA Progression</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.gpaTrend}>
                    <defs>
                      <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c4a16b" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#c4a16b" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="semester" stroke="rgba(255,255,255,0.8)" tick={{ fill: 'rgba(255,255,255,0.8)' }} axisLine={{ stroke: 'rgba(255,255,255,0.3)' }} />
                    <YAxis domain={['dataMin - 0.2', 4.0]} stroke="rgba(255,255,255,0.8)" tick={{ fill: 'rgba(255,255,255,0.8)' }} axisLine={{ stroke: 'rgba(255,255,255,0.3)' }} />
                    <Tooltip contentStyle={{ background: 'rgba(10,20,40,0.9)', border: '1px solid #c4a16b', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="gpa" stroke="#c4a16b" strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" name="Semester GPA" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 h-100 position-relative text-white" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'}>
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}>Recent Activity</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <YAxis stroke="rgba(255,255,255,0.8)" tick={{ fill: 'rgba(255,255,255,0.8)' }} axisLine={{ stroke: 'rgba(255,255,255,0.3)' }} />
                    <Tooltip contentStyle={{ background: 'rgba(10,20,40,0.9)', border: '1px solid #6fc3ff', borderRadius: '8px', color: '#fff' }} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="assignments" stroke="#6fc3ff" strokeWidth={3} dot={{ r: 6, fill: '#1a2a40', stroke: '#6fc3ff', strokeWidth: 2 }} name="Assignments" />
                    <Line type="monotone" dataKey="quizzes" stroke="#00ff88" strokeWidth={3} dot={{ r: 6, fill: '#1a2a40', stroke: '#00ff88', strokeWidth: 2 }} name="Quizzes" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 3: Horizontal Bar Chart (Subject Grades) */}
          <div className="row g-4 mb-5">
            <div className="col-lg-12">
              <div className="p-4 h-100 position-relative text-white" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}>Grades By Subject</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.subjectGrades} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <YAxis dataKey="subject" type="category" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} width={80} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(10,20,40,0.9)', border: '1px solid rgba(111,195,255,0.5)', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="score" fill="#c4a16b" radius={[0, 6, 6, 0]} name="Score (%)">
                      {stats.subjectGrades.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 90 ? '#6fc3ff' : entry.score >= 80 ? '#00ff88' : '#c4a16b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 4: Detailed Academic Records Grouped by Year */}
          <div className="row g-4 mb-5">
            <div className="col-lg-12">
              <div className="p-4 h-100 position-relative text-white" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <h4 className="mb-4 d-flex align-items-center" style={{ color: '#fff', fontWeight: 600 }}>
                  <i className="bi bi-journal-bookmark-fill me-2" style={{ color: '#c4a16b' }}></i> Detailed Academic Records
                </h4>
                
                {stats.subjectGrades && stats.subjectGrades.length > 0 ? (
                  Object.entries(
                    stats.subjectGrades.reduce((acc, curr) => {
                      const year = curr.year_level || 1;
                      if (!acc[year]) acc[year] = [];
                      acc[year].push(curr);
                      return acc;
                    }, {})
                  ).sort(([a], [b]) => a - b).map(([year, subjects]) => (
                    <div key={year} className="mb-5 last-child-mb-0">
                      <div className="d-flex align-items-center mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                        <div className="bg-primary bg-opacity-25 text-primary rounded-pill px-3 py-1 fw-bold small me-3 border border-primary border-opacity-50">
                          Year {year}
                        </div>
                        <div className="text-muted small">{subjects.length} Total Subjects</div>
                      </div>
                      <div className="row g-3">
                        {subjects.map((item, idx) => (
                          <div key={idx} className="col-md-6 col-xl-4">
                            <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s ease' }}>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-white-50 small text-truncate pe-2">{item.subject}</span>
                                <span className="fw-bold" style={{ color: item.score >= 90 ? '#6fc3ff' : item.score >= 50 ? '#00ff88' : '#ff4d4d' }}>{item.score}%</span>
                              </div>
                              <div className="progress" style={{ height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{ 
                                    width: `${item.score}%`, 
                                    background: item.score >= 90 ? 'linear-gradient(90deg, #6fc3ff, #00ff88)' : 'linear-gradient(90deg, #c4a16b, #2ecc71)',
                                    boxShadow: '0 0 10px rgba(111, 195, 255, 0.3)'
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 opacity-50">
                    <i className="bi bi-clipboard-x mb-3 d-block" style={{ fontSize: '3rem' }}></i>
                    <p>No academic records available for this curriculum.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 5: Attendance History Table */}
            <div className="col-lg-12">
              <div className="p-4 h-100 position-relative text-white" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}><i className="bi bi-table me-2" style={{ color: '#6fc3ff' }}></i>Detailed Attendance Log</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-borderless text-white mb-0" style={{ minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th className="pb-3" style={{ color: '#6fc3ff', fontSize: '0.9rem' }}>Date</th>
                        <th className="pb-3" style={{ color: '#6fc3ff', fontSize: '0.9rem' }}>Subject</th>
                        <th className="pb-3" style={{ color: '#6fc3ff', fontSize: '0.9rem', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.attendanceHistory?.length > 0 ? (
                        stats.attendanceHistory.map((record, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td className="py-3" style={{ fontSize: '0.95rem' }}>{new Date(record.date).toLocaleDateString()}</td>
                            <td className="py-3" style={{ fontSize: '0.95rem', fontWeight: 500 }}>{record.course}</td>
                            <td className="py-3 text-center">
                              <span className={`badge ${record.status === 'present' ? 'bg-success' : 'bg-danger'}`} style={{ padding: '6px 12px', borderRadius: '20px', fontWeight: 600, textTransform: 'capitalize' }}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-5 text-muted italic">No attendance records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          
        </>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">No statistics data available yet.</p>
        </div>
      )}
    </>
  )
}
