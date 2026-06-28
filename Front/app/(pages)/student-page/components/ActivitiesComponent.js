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

function ActivityDetailModal({ activity, onClose }) {
  if (!activity) return null

  const imgSrc = activity.img_url || defaultActivityImage(activity.title)
  const statusText = activity.status === 'upcoming' ? 'Coming Soon' : 'Completed'
  const statusColor = activity.status === 'upcoming' ? '#f39c12' : '#00ff88'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-detail-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(92vw, 520px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(160deg, #1a2a40 0%, #0f1828 100%)',
          border: '1px solid rgba(111,195,255,0.35)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        <img
          src={imgSrc}
          alt={activity.title}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          onError={(e) => { e.currentTarget.src = defaultActivityImage(activity.title) }}
        />
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <h3 id="activity-detail-title" style={{ color: '#6fc3ff', margin: 0, fontSize: '1.35rem' }}>
              {activity.title}
            </h3>
            <span style={{
              background: `${statusColor}22`,
              color: statusColor,
              border: `1px solid ${statusColor}`,
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {statusText}
            </span>
          </div>

          <p style={{ color: '#999', margin: '0 0 16px', fontSize: '0.9rem' }}>
            Category: <span style={{ color: '#ccc' }}>{activity.category || 'General'}</span>
          </p>

          <p style={{ color: '#ddd', lineHeight: 1.7, marginBottom: '20px' }}>
            {activity.description || 'No description available.'}
          </p>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.9rem' }}>
              <CalendarIcon size={15} color="#6fc3ff" />
              <span>Event date: {activity.date ? new Date(activity.date).toLocaleDateString() : 'TBA'}</span>
            </div>
            {activity.registration_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                <CalendarIcon size={15} color="#00ff88" />
                <span>You joined: {new Date(activity.registration_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline-light w-100 mt-4"
            style={{ minHeight: '44px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ActivitiesComponent({ studentId }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState(null)

  useEffect(() => {
    if (studentId) fetchAttendedActivities()
  }, [studentId])

  const fetchAttendedActivities = async () => {
    try {
      setLoading(true)
      const res = await api.activities.getStudentActivities(studentId)
      if (res.status === 'success') {
        setActivities(res.data || [])
      }
    } catch (err) {
      console.error('Error fetching student activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => (status === 'upcoming' ? 'warning' : 'success')
  const getStatusText = (status) => (status === 'upcoming' ? 'Coming Soon' : 'Completed')

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading your activities...</div>
      ) : (
        <>
          <h2 style={{ color: '#6fc3ff', fontWeight: 'bold' }} className="mb-4">
            My Activities & Events
          </h2>

          {activities.length > 0 ? (
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

                      <p style={{ color: '#ccc', margin: '10px 0' }}>
                        {activity.description?.length > 100
                          ? `${activity.description.slice(0, 100)}…`
                          : activity.description}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid #333',
                        paddingTop: '10px',
                        marginTop: '10px',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}>
                        <small style={{ color: '#999' }}>
                          <CalendarIcon size={13} color="#999" style={{ marginRight: '4px' }} />
                          {activity.date ? new Date(activity.date).toLocaleDateString() : 'TBA'}
                        </small>

                        <button
                          type="button"
                          className="btn btn-outline-info btn-sm"
                          style={{ minHeight: '36px', minWidth: '90px' }}
                          onClick={() => setSelectedActivity(activity)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info mt-2">
              You have not joined any activities yet. Once you attend an activity, it will appear here.
            </div>
          )}
        </>
      )}

      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  )
}
