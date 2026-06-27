import { useState, useEffect } from 'react'
import { CalendarIcon } from '@/app/components/Icons'
import { api } from '@/lib/api'

export default function AssignmentsComponent() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
      if (studentId) {
        const res = await api.assignments.getByStudentId(studentId);
        if (res.status === 'success' && res.data) {
           const mapped = res.data.map(item => ({
              id: item.id,
              title: item.title || 'Untitled Assignment',
              subject: item.course_name || 'General',
              dueDate: item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : 'No Date',
              status: new Date(item.end_date) < new Date() ? 'submitted' : 'pending',
              description: item.description || '',
              points: 50
           }));
           setAssignments(mapped);
        }
      }
      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'submitted': 'info',
      'graded': 'success',
      'late': 'danger'
    }
    return colors[status] || 'secondary'
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pending',
      'submitted': 'Submitted',
      'graded': 'Graded',
      'late': 'Late'
    }
    return texts[status] || status
  }

  const daysUntilDue = (dueDate) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diff = Math.floor((due - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading assignments...</div>
      ) : (
        <>
          <h2 style={{color: '#6fc3ff', fontWeight: 'bold'}} className="mb-4">Assignments & Tasks</h2>
          
          <div style={{marginBottom: '20px'}}>
            <div className="btn-group" role="group">
              <button className="btn btn-outline-info">All</button>
              <button className="btn btn-outline-info">Pending</button>
              <button className="btn btn-outline-info">Submitted</button>
              <button className="btn btn-outline-info">Graded</button>
            </div>
          </div>

          <div className="row g-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="col-lg-6">
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #6fc3ff',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                    <div>
                      <h5 style={{color: '#6fc3ff'}}>{assignment.title}</h5>
                      <small style={{color: '#999'}}>{assignment.subject}</small>
                    </div>
                    <span className={`badge bg-${getStatusColor(assignment.status)}`}>
                      {getStatusText(assignment.status)}
                    </span>
                  </div>
                  
                  <p style={{color: '#ccc', margin: '10px 0', fontSize: '14px'}}>{assignment.description}</p>
                  
                  <div style={{
                    backgroundColor: '#2a2a4e',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '10px'
                  }}>
                    <small style={{color: '#ccc'}}>
                      <CalendarIcon size={13} color="#ccc" style={{marginRight: '4px'}} />Due Date: {assignment.dueDate}
                      {assignment.status === 'pending' && (
                        <span style={{color: daysUntilDue(assignment.dueDate) <= 3 ? '#ff6b6b' : '#6fc3ff', marginLeft: '10px'}}>
                          ({daysUntilDue(assignment.dueDate)} days left)
                        </span>
                      )}
                    </small>
                  </div>

                  {assignment.status === 'submitted' && (
                    <div style={{marginBottom: '10px'}}>
                      <small style={{color: '#ccc'}}>Submitted Date: {assignment.submittedDate}</small>
                    </div>
                  )}

                  {assignment.status === 'graded' && (
                    <div style={{
                      backgroundColor: '#2a2a4e',
                      padding: '10px',
                      borderRadius: '5px',
                      marginBottom: '10px'
                    }}>
                      <small style={{color: '#99ff99'}}>
                        Grade: {assignment.grade}/{assignment.points}
                      </small>
                    </div>
                  )}

                  <div style={{display: 'flex', gap: '10px'}}>
                    {assignment.status === 'pending' && (
                      <button className="btn btn-outline-info btn-sm" style={{flex: 1}}>
                        Submit Solution
                      </button>
                    )}
                    <button className="btn btn-outline-secondary btn-sm" style={{flex: 1}}>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {assignments.length === 0 && (
            <div className="alert alert-info mt-4">
              No assignments currently available
            </div>
          )}
        </>
      )}
    </>
  )
}
