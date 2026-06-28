'use client'
import '@/styles/doctor.css'
import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  Area, AreaChart
} from 'recharts'

import api from '@/lib/api'

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) return
        
        const res = await api.request(`/statistics/doctor/${userId}`)
        if (res.status === 'success') {
          setStats(res.data)
        }
      } catch (err) {
        console.error('Error fetching doctor stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

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

  if (loading) return <div style={{ color: '#2b3a55', textAlign: 'center', marginTop: '100px', fontSize: '1.5rem', fontWeight: 700 }}>Loading Analytics...</div>
  if (!stats) return <div style={{ color: '#2b3a55', textAlign: 'center', marginTop: '100px' }}>No statistical data available.</div>

  const attendanceData = stats.attendanceData
  const gradesData = stats.gradesData
  const classDistribution = stats.classDistribution
  const activityData = [
    { week: 'W1', lectures: 4, assignments: stats.totalAssignments / 4, quizzes: 1 },
    { week: 'W2', lectures: 4, assignments: stats.totalAssignments / 2, quizzes: 2 },
  ]

  return (
    <>
      <div id="cursor-glow"></div>
      <Header title="Doctor Statistics" />

      <div className="main-content container-fluid p-3 p-md-4" style={{ maxWidth: '1200px' }}>
        {/* Page Title Section */}
        <div className="text-center my-5">
          <h1 className="display-4" style={{ color: '#2b3a55', fontWeight: 800 }}>
            <i className="bi bi-graph-up-arrow me-3"></i>Student Analytics
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: 500 }}>Detailed overview of attendance, academic performance, and engagement.</p>
        </div>

        {/* Period Selector Component */}
        <div className="d-flex justify-content-center mb-5">
          <div className="period-selector p-1" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.8)', display: 'inline-flex' }}>
            {['week', 'month', 'semester'].map((period) => (
              <span
                key={period}
                className={`btn px-4 py-2 ${selectedPeriod === period ? 'active-period' : ''}`}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  fontWeight: selectedPeriod === period ? 700 : 500,
                  color: selectedPeriod === period ? 'white' : '#888',
                  background: selectedPeriod === period ? 'linear-gradient(to right, #2b3a55, #3d5278)' : 'transparent',
                  padding: '8px 18px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedPeriod === period ? '0 4px 12px rgba(43,58,85,0.25)' : 'none',
                  textTransform: 'capitalize',
                  border: 'none',
                  margin: '0 2px'
                }}
              >
                {period}
              </span>
            ))}
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="row g-4 mb-5">
          {[
            { label: 'Attendance Rate', val: stats.attendanceRate, sub: `${stats.totalStudents} Active Students`, color: '#6fc3ff', icon: 'bi-person-check', bg: '#3a4f6d', shadow: 'rgba(58,79,109,0.25)', bgIcon: 'bi-people-fill' },
            { label: 'Avg. Rating', val: '4.8/5.0', sub: 'Calculated Score', color: '#c4a16b', icon: 'bi-star-fill', bg: 'linear-gradient(135deg, #b8905a, #d4ab7a)', shadow: 'rgba(196,161,107,0.3)', bgIcon: 'bi-star' },
            { label: 'Total Assignments', val: stats.totalAssignments, sub: 'Created by you', color: '#ff6b6b', icon: 'bi-file-earmark-text', bg: 'linear-gradient(135deg, #7a94ae, #a0bcd4)', shadow: 'rgba(140,163,186,0.3)', bgIcon: 'bi-journal-text' },
            { label: 'Success Rate', val: stats.successRate, sub: 'Overall Performance', color: '#2b3a55', icon: 'bi-mortarboard-fill', bg: 'linear-gradient(135deg, #4f6a8f, #6b89b1)', shadow: 'rgba(79,106,143,0.3)', bgIcon: 'bi-award-fill' }
          ].map((metric, i) => (
            <div className="col-md-3" key={i}>
              <div className="p-4 text-white position-relative stat-card-anim h-100" style={{ background: metric.bg, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 6px 20px ${metric.shadow}`, overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.15, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}></div>
                <i className={`bi ${metric.bgIcon} position-absolute`} style={{ fontSize: '8rem', right: '-15px', bottom: '-25px', opacity: 0.05, transform: 'rotate(-10deg)' }}></i>
                <div className="position-relative z-1 d-flex flex-column align-items-center text-center">
                  <i className={`bi ${metric.icon} fs-1 mb-3`} style={{ opacity: 0.9 }}></i>
                  <h6 style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 500 }}>{metric.label}</h6>
                  <h4 style={{ margin: '0 0 5px 0', fontWeight: 800, fontSize: '1.6rem' }}>{metric.val}</h4>
                  <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{metric.sub}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Row 1 */}
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
            <div className="p-4 h-100 position-relative text-white" style={{ background: 'linear-gradient(135deg, #2b3a55, #4f6a8f)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(43,58,85,0.3)', overflow: 'hidden', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(43,58,85,0.4)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(43,58,85,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.1, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
              <div className="position-relative z-1">
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}><i className="bi bi-calendar-check me-2" style={{ color: '#6fc3ff' }}></i>Weekly Attendance</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', color: '#2b3a55', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Bar dataKey="present" fill="#6fc3ff" radius={[6, 6, 0, 0]} name="Present" />
                    <Bar dataKey="absent" fill="#ff6b6b" radius={[6, 6, 0, 0]} name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="p-4 h-100 text-center text-white position-relative" style={{ background: 'linear-gradient(135deg, #7a94ae, #a0bcd4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(122,148,174,0.3)', overflow: 'hidden', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(122,148,174,0.4)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(122,148,174,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.1, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
              <div className="position-relative z-1">
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}><i className="bi bi-people me-2" style={{ color: '#2b3a55' }}></i>Students Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={classDistribution} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                      {classDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', color: '#2b3a55', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section Row 2 */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="p-4 h-100 text-white position-relative" style={{ background: 'linear-gradient(135deg, #b8905a, #d4ab7a)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(196,161,107,0.3)', overflow: 'hidden', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(196,161,107,0.4)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(196,161,107,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.1, backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }}></div>
              <div className="position-relative z-1">
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}><i className="bi bi-award me-2" style={{ color: 'rgba(255,255,255,0.9)' }}></i>Grade Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={gradesData}>
                    <defs>
                      <linearGradient id="colorGradeWhite" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="grade" stroke="rgba(255,255,255,0.8)" tick={{ fill: 'rgba(255,255,255,0.8)' }} axisLine={{ stroke: 'rgba(255,255,255,0.3)' }} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', color: '#c4a16b', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="count" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorGradeWhite)" name="Students" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="p-4 h-100 text-white position-relative" style={{ background: 'linear-gradient(135deg, #1d2b40, #2b3a55)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(29,43,64,0.3)', overflow: 'hidden', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(29,43,64,0.4)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(29,43,64,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.1, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
              <div className="position-relative z-1">
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}><i className="bi bi-activity me-2" style={{ color: '#ff6b6b' }}></i>Engagement Activity</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', color: '#2b3a55', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="lectures" stroke="#6fc3ff" strokeWidth={3} dot={{ r: 6, fill: '#3a4f6d', stroke: '#6fc3ff', strokeWidth: 2 }} name="Lectures" />
                    <Line type="monotone" dataKey="assignments" stroke="#c4a16b" strokeWidth={3} dot={{ r: 6, fill: '#3a4f6d', stroke: '#c4a16b', strokeWidth: 2 }} name="Assignments" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="p-4 h-100 text-white position-relative" style={{ background: 'linear-gradient(135deg, #4f6a8f, #6b89b1)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(79,106,143,0.3)', overflow: 'hidden', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(79,106,143,0.4)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,106,143,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.1, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
              <div className="position-relative z-1">
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}><i className="bi bi-lightbulb me-2" style={{ color: '#c4a16b' }}></i>Insights & Highlights</h4>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded text-center" style={{ background: 'rgba(111, 195, 255, 0.15)', border: '1px solid rgba(111, 195, 255, 0.3)', backdropFilter: 'blur(5px)' }}>
                      <h6 className="text" style={{ color: 'rgba(255,255,255,0.9)' }}>Peak Attendance</h6>
                      <p className="fs-4 fw-bold mb-0" style={{ color: '#6fc3ff' }}>Wednesday</p>
                      <small style={{ color: 'rgba(255,255,255,0.6)' }}>98.2% attendance</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded text-center" style={{ background: 'rgba(255, 107, 107, 0.15)', border: '1px solid rgba(255, 107, 107, 0.3)', backdropFilter: 'blur(5px)' }}>
                      <h6 className="text" style={{ color: 'rgba(255,255,255,0.9)' }}>Top Absence</h6>
                      <p className="fs-4 fw-bold mb-0" style={{ color: '#ff6b6b' }}>Tuesday</p>
                      <small style={{ color: 'rgba(255,255,255,0.6)' }}>8.9% absent rate</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-4 h-100 text-white position-relative" style={{ background: 'linear-gradient(135deg, #1d2b40, #2b3a55)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(29,43,64,0.3)', overflow: 'hidden', transition: 'all 0.3s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(29,43,64,0.4)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(29,43,64,0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.1, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
              <div className="position-relative z-1">
                <h4 className="mb-4" style={{ color: '#fff', fontWeight: 600 }}><i className="bi bi-graph-up me-2" style={{ color: '#6fc3ff' }}></i>Performance Indicators</h4>
                <div className="mb-4 mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>Exam Success Rate</span>
                    <span className="fw-bold" style={{ color: '#6fc3ff' }}>87%</span>
                  </div>
                  <div className="progress shadow-sm" style={{ height: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                    <div className="progress-bar" style={{ width: '87%', background: 'linear-gradient(90deg, #6fc3ff, #8bd0ff)', borderRadius: '10px' }}></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>Assignment Submissions</span>
                    <span className="fw-bold" style={{ color: '#c4a16b' }}>92%</span>
                  </div>
                  <div className="progress shadow-sm" style={{ height: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                    <div className="progress-bar" style={{ width: '92%', background: 'linear-gradient(90deg, #c4a16b, #e0c89c)', borderRadius: '10px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CircularMenu />
    
    </>
  )
}