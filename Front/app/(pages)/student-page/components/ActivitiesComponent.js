import { useState, useEffect } from 'react'
import { CalendarIcon } from '@/app/components/Icons'
import api from '../../../../lib/api'

export default function ActivitiesComponent() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedActivityId, setExpandedActivityId] = useState(null)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }
      const res = await api.students.getActivities(userId);
      if (res.status === 'success' && res.data) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    return status === 'upcoming' ? 'warning' : 'success'
  }

  const getStatusText = (status) => {
    return status === 'upcoming' ? 'Coming Soon' : 'Completed'
  }

  const toggleDetails = (id) => {
    if (expandedActivityId === id) {
      setExpandedActivityId(null);
    } else {
      setExpandedActivityId(id);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  }

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading activities...</div>
      ) : (
        <>
          <h2 style={{color: '#6fc3ff', fontWeight: 'bold'}} className="mb-4">University Activities & Events</h2>
          
          <div className="row g-4">
            {activities.map((activity) => (
              <div key={activity.id} className="col-lg-6 col-md-6 col-sm-12">
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #6fc3ff',
                  borderRadius: '8px',
                  padding: '20px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                    <div>
                      <h5 style={{color: '#6fc3ff'}}>{activity.title}</h5>
                      <small style={{color: '#999'}}>Category: {activity.category}</small>
                    </div>
                    <span className={`badge bg-${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                  
                  {/* Activity Description (Expandable) */}
                  <div style={{
                    maxHeight: expandedActivityId === activity.id ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-in-out',
                    marginTop: expandedActivityId === activity.id ? '15px' : '0'
                  }}>
                    <p style={{color: '#ccc', margin: '0', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.9rem'}}>
                      {activity.description}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #333',
                    paddingTop: '10px',
                    marginTop: 'auto' // Push to bottom
                  }}>
                    <small style={{color: '#999'}}><CalendarIcon size={13} color="#999" style={{marginRight: '4px'}} />{formatDate(activity.date)}</small>
                    <button 
                      className="btn btn-outline-info btn-sm"
                      onClick={() => toggleDetails(activity.id)}
                    >
                      {expandedActivityId === activity.id ? 'Hide Details' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="alert alert-info mt-4" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #6fc3ff' }}>
              No activities currently available for your profile.
            </div>
          )}
        </>
      )}
    </>
  )
}
