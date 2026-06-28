'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon } from '@/app/components/Icons'
import api from '@/lib/api'

const defaultActivityImage = (title = '') => {
  const map = {
    'Programming Competition': '/Pics/Programming Competition.webp',
    'Guest Lecture - AI in Medicine': '/Pics/Guest Lecture - AI in Medicine.webp',
    'Workshop - Web Development': '/Pics/Workshop - Web Development.webp',
    'Graduation Ceremony': '/Pics/Graduation Ceremony.webp',
  }
  return map[title] || '/Pics/11.png'
}

export default function ActivitiesComponent({ studentId }) {
  const [activities, setActivities] = useState([])
  const [studentActivityIds, setStudentActivityIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) fetchAllData()
  }, [studentId])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [allRes, studentRes] = await Promise.all([
        api.activities.getAll(),
        api.activities.getStudentActivities(studentId),
      ])

      if (allRes.status === 'success') {
        setActivities(allRes.data || [])
      }

      if (studentRes.status === 'success') {
        setStudentActivityIds((studentRes.data || []).map(a => a.id))
      }
    } catch (err) {
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (activityId) => {
    try {
      const res = await api.activities.join(studentId, activityId)
      if (res.status === 'success') {
        setStudentActivityIds(prev => [...prev, activityId])
        alert('Joined activity successfully!')
      }
    } catch (err) {
      console.error('Error joining activity:', err)
      alert('Failed to join activity.')
    }
  }

  const getStatusColor = (status) => (status === 'upcoming' ? 'warning' : 'success')
  const getStatusText = (status) => (status === 'upcoming' ? 'Coming Soon' : 'Completed')

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading activities...</div>
      ) : (
        <>
          <h2 style={{ color: '#6fc3ff', fontWeight: 'bold' }} className="mb-4">University Activities & Events</h2>

          <div className="row g-4">
            {activities.map((activity) => (
              <div key={activity.id} className="col-lg-6">
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #6fc3ff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}>
                  <img
                    src={activity.img_url || defaultActivityImage(activity.title)}
                    alt={activity.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = defaultActivityImage(activity.title) }}
                  />
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h5 style={{ color: '#6fc3ff' }}>{activity.title}</h5>
                        <small style={{ color: '#999' }}>Category: {activity.category}</small>
                      </div>
                      <span className={`badge bg-${getStatusColor(activity.status)}`}>
                        {getStatusText(activity.status)}
                      </span>
                    </div>

                    <p style={{ color: '#ccc', margin: '10px 0' }}>{activity.description}</p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #333',
                      paddingTop: '10px',
                      marginTop: '10px',
                    }}>
                      <small style={{ color: '#999' }}>
                        <CalendarIcon size={13} color="#999" style={{ marginRight: '4px' }} />
                        {activity.date ? new Date(activity.date).toLocaleDateString() : 'TBA'}
                      </small>

                      {activity.status === 'completed' ? (
                        <button type="button" className="btn btn-outline-info btn-sm">Details</button>
                      ) : (
                        <button
                          type="button"
                          className={`btn btn-sm ${studentActivityIds.includes(activity.id) ? 'btn-success' : 'btn-primary'}`}
                          disabled={studentActivityIds.includes(activity.id)}
                          onClick={() => handleJoin(activity.id)}
                        >
                          {studentActivityIds.includes(activity.id) ? 'Joined' : 'Join Activity'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="alert alert-info mt-4">No activities currently available</div>
          )}
        </>
      )}
    </>
  )
}
