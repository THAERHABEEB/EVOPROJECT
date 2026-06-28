import { useState, useEffect } from 'react'
import { CalendarIcon } from '@/app/components/Icons'
import api from '@/lib/api'

export default function AssignmentsComponent({ studentId }) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Auto-sync grades once on load
      await api.request('/quiz/debug/sync-grades')

      const res = await api.request(`/quiz/student/${studentId}`)
      console.log('API Response:', res)
      if (res.status === 'success') {
        setQuizzes(res.data)
      } else {
        setError('Server returned error status')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (studentId) fetchQuizzes()
  }, [studentId])

  const startQuiz = async (id) => {
    try {
      setQuizLoading(true)
      const res = await api.request(`/quiz/${id}`)
      if (res.status === 'success') {
        setActiveQuiz(res.data)
        setAnswers({})
        setQuizResult(null)
      }
    } catch (err) {
      alert('Failed to load quiz')
    } finally {
      setQuizLoading(false)
    }
  }

  if (activeQuiz) {
    return (
      <div className="p-3 bg-dark text-white rounded">
        <button className="btn btn-sm btn-outline-light mb-3" onClick={() => setActiveQuiz(null)}>Back</button>
        {quizResult ? (
          <div className="text-center p-4">
            <h3>Score: {quizResult.score} / {quizResult.totalPossible}</h3>
            <button className="btn btn-info mt-3" onClick={() => setActiveQuiz(null)}>Return</button>
          </div>
        ) : (
          <div>
            <h4>{activeQuiz.title}</h4>
            <div className="mt-3">
              {activeQuiz.questions?.map((q, i) => (
                <div key={q.id} className="mb-4 p-3 border border-secondary rounded">
                  <p className="fw-bold">{i+1}. {q.question_text}</p>
                  {q.options?.map(opt => (
                    <label key={opt.id} className="d-block p-2 border border-dark mb-1 rounded" style={{cursor:'pointer'}}>
                      <input type="radio" name={`q-${q.id}`} className="me-2" onChange={() => setAnswers({...answers, [q.id]: opt.id})} />
                      {opt.option_text}
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <button className="btn btn-info w-100 py-3 mt-3" onClick={async () => {
              const res = await api.request('/quiz/submit', {
                method: 'POST',
                body: JSON.stringify({ quiz_id: activeQuiz.id, student_id: studentId, answers })
              })
              if (res.status === 'success') setQuizResult(res.data)
            }}>SUBMIT</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-3" style={{color: '#fff'}}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0" style={{color: '#6fc3ff'}}>Assignments</h2>
        <button className="btn btn-sm btn-outline-info" onClick={fetchQuizzes}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="text-center p-5">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">Error: {error}</div>
      ) : (
        <div className="row g-3">
          {quizzes.length === 0 ? (
            <div className="text-center p-5 text-muted">No assignments found for Student ID: {studentId}</div>
          ) : (
            quizzes.map(quiz => {
              const isExpired = quiz.due_date && new Date(quiz.due_date) < new Date();
              return (
                <div key={quiz.id} className="col-12">
                  <div className="p-4 rounded border border-info" style={{background: '#1a1a2e', opacity: isExpired ? 0.7 : 1}}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="m-0" style={{color: '#6fc3ff'}}>{quiz.title}</h4>
                      <span className={`badge ${quiz.student_score !== null ? 'bg-success' : (isExpired ? 'bg-danger' : 'bg-warning text-dark')}`}>
                        {quiz.student_score !== null ? `Score: ${quiz.student_score}` : (isExpired ? 'Expired' : 'Pending')}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <small className={isExpired ? 'text-danger' : 'text-info'}>
                        Deadline: {quiz.due_date ? new Date(quiz.due_date).toLocaleString() : 'No deadline'}
                        {isExpired && <span className="ms-2 fw-bold">(Expired)</span>}
                      </small>
                    </div>

                    <p className="mb-4" style={{color: '#ccc'}}>{quiz.description}</p>
                    
                    <button 
                      className={`btn w-100 py-2 fw-bold ${isExpired ? 'btn-secondary' : 'btn-info'}`} 
                      onClick={() => !isExpired && startQuiz(quiz.id)}
                      disabled={isExpired || quiz.student_score !== null}
                    >
                      {quiz.student_score !== null ? 'COMPLETED' : (isExpired ? 'EXPIRED' : 'START NOW')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  )
}
