import { useState, useEffect } from 'react'
import { CalendarIcon } from '@/app/components/Icons'
import { api } from '@/lib/api'

export default function AssignmentsComponent() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissionUrl, setSubmissionUrl] = useState('')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
      if (studentId) {
        // Fetch the new course_assignments
        const res = await api.assignments.getCourseAssignmentsForStudent(studentId);
        if (res.status === 'success' && res.data) {
           setAssignments(res.data);
        }
      }
      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setLoading(false)
    }
  }

  const getStatusColor = (status, endDate) => {
    if (status === 'graded') return 'success';
    if (status === 'submitted') return 'info';
    if (new Date() > new Date(endDate)) return 'danger';
    return 'warning';
  }

  const getStatusText = (status, endDate) => {
    if (status === 'graded') return 'Graded';
    if (status === 'submitted') return 'Submitted';
    if (new Date() > new Date(endDate)) return 'Deadline Passed';
    return 'Pending';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
      const data = {
        assignment_id: selectedAssignment.id,
        student_id: studentId,
        file_url: submissionUrl
      };
      const res = await api.assignments.submit(data);
      if (res.status === 'success') {
        alert('Submitted successfully!');
        setSelectedAssignment(null);
        setSubmissionUrl('');
        fetchAssignments();
      } else {
        alert('Error: ' + res.error);
      }
    } catch (err) {
      alert('Submission failed.');
    }
  }

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading assignments...</div>
      ) : (
        <div className="row g-4">
          {assignments.map(assignment => {
            const status = assignment.submission_status || 'pending';
            const color = getStatusColor(status, assignment.end_date);
            const text = getStatusText(status, assignment.end_date);
            return (
              <div key={assignment.id} className="col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title mb-1" style={{ color: '#2b3a55', fontWeight: 600 }}>{assignment.title}</h5>
                        <p className="card-text text-muted mb-0">{assignment.course_name}</p>
                      </div>
                      <span className={`badge bg-${color} px-3 py-2 rounded-pill`}>
                        {text}
                      </span>
                    </div>
                    <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                      {assignment.details ? (assignment.details.substring(0, 80) + '...') : ''}
                    </p>
                    <hr/>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="d-flex flex-column">
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                          <CalendarIcon className="me-2" style={{ width: '14px', height: '14px', fill: 'currentColor' }}/>
                          Due: {new Date(assignment.end_date).toLocaleDateString()}
                        </span>
                        {status === 'graded' && (
                          <strong className="text-success mt-1">Grade: {assignment.student_grade}/{assignment.total_grade}</strong>
                        )}
                      </div>
                      <button className="btn btn-sm btn-outline-primary rounded-pill px-4" onClick={() => setSelectedAssignment(assignment)}>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {assignments.length === 0 && (
            <div className="col-12 text-center p-5 text-muted">
              <i className="bi bi-journal-x fs-1 d-block mb-3"></i>
              No assignments found.
            </div>
          )}
        </div>
      )}

      {selectedAssignment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setSelectedAssignment(null)}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 style={{ color: '#2b3a55', fontWeight: 600, margin: 0 }}>{selectedAssignment.title}</h4>
              <button className="btn-close" onClick={() => setSelectedAssignment(null)}></button>
            </div>
            {selectedAssignment.image_url && (
              <img src={selectedAssignment.image_url} alt="Assignment Cover" className="img-fluid rounded mb-3" style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }} />
            )}
            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedAssignment.details}</p>
            <div className="mb-4">
              <strong>Resource Link: </strong>
              <a href={selectedAssignment.file_url} target="_blank" rel="noreferrer" className="text-primary">Open Assignment File / Form</a>
            </div>
            <div className="mb-3">
              <strong>Total Grade:</strong> {selectedAssignment.total_grade}
            </div>
            <hr className="my-4"/>
            
            {selectedAssignment.submission_status === 'graded' ? (
              <div className="alert alert-success">
                <strong>Graded!</strong> You scored {selectedAssignment.student_grade} / {selectedAssignment.total_grade}.
              </div>
            ) : new Date() > new Date(selectedAssignment.end_date) ? (
              <div className="alert alert-danger">
                <strong>Deadline Passed.</strong> You can no longer submit this assignment.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Submit your Answer (Link/URL)</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="e.g., Google Form completion link, Google Doc link" 
                    value={submissionUrl} 
                    onChange={e => setSubmissionUrl(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" style={{ background: 'linear-gradient(to right, #c4a16b, #e0c89c)', border: 'none' }}>
                  Submit Answer
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
