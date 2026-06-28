'use client'
import '@/styles/doctor.css'
import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import api from '@/lib/api'

export default function AssignmentsPage() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDesc, setQuizDesc] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [questions, setQuestions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    const doctorId = localStorage.getItem('userId')
    if (doctorId) {
      api.doctors.getCourses(doctorId).then(res => {
        if (res.status === 'success') {
          setCourses(res.data)
          if (res.data.length > 0) setSelectedCourseId(res.data[0].id)
        }
      })
    }
  }, [])

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: type,
      points: 5, // Default to 5 points
      options: type === 'mcq' ? [
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ] : type === 'true_false' ? [
        { text: 'True', is_correct: true },
        { text: 'False', is_correct: false }
      ] : []
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestionText = (id, text) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q))
  }

  const updateQuestionPoints = (id, points) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, points: parseFloat(points) || 0 } : q))
  }

  const updateOptionText = (qId, optIdx, text) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options]
        newOptions[optIdx].text = text
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const setCorrectOption = (qId, optIdx) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = q.options.map((opt, idx) => ({
          ...opt,
          is_correct: idx === optIdx
        }))
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleSubmit = async () => {
    if (!quizTitle || !selectedCourseId || questions.length === 0 || !dueDate) {
      alert('Please fill in all fields, including the Due Date.')
      return
    }

    setIsSubmitting(true)
    try {
      const doctorId = localStorage.getItem('userId')
      const res = await api.request('/quiz/create', {
        method: 'POST',
        body: {
          course_id: selectedCourseId,
          doctor_id: doctorId,
          title: quizTitle,
          description: quizDesc,
          due_date: dueDate,
          questions: questions.map(q => ({
            text: q.text,
            type: q.type,
            points: q.points,
            options: q.options
          }))
        }
      })

      if (res.status === 'success') {
        setStatusMessage(`Assignment created successfully! Task #${res.data.task_number}`)
        setQuizTitle('')
        setQuizDesc('')
        setDueDate('')
        setQuestions([])
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create assignment.')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setStatusMessage(''), 5000)
    }
  }

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)

  return (
    <>
      <Header title="Assignments Builder" />
      <div id="cursor-glow"></div>

      <div className="main-content container-fluid p-4" style={{ maxWidth: '900px' }}>
        <div className="card p-4 shadow-sm mb-4" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(196, 161, 107, 0.2)' }}>
          <h2 className="mb-4" style={{ color: '#2b3a55', fontWeight: 800 }}>Create New Assignment</h2>
          
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Select Course</label>
              <select className="form-select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-danger">Due Date (Deadline)</label>
              <input type="datetime-local" className="form-control border-danger" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label fw-bold">Assignment Title</label>
              <input type="text" className="form-control" placeholder="e.g. Midterm Quiz" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label fw-bold">Description (Optional)</label>
              <textarea className="form-control" rows="2" value={quizDesc} onChange={e => setQuizDesc(e.target.value)}></textarea>
            </div>
          </div>
        </div>

        {questions.map((q, idx) => (
          <div key={q.id} className="card p-4 shadow-sm mb-4 animate__animated animate__fadeInUp" style={{ borderRadius: '15px', borderLeft: '5px solid #c4a16b' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-secondary">Question {idx + 1} - {q.type.toUpperCase()}</span>
              <div className="d-flex align-items-center gap-2">
                <label className="small fw-bold m-0">Points:</label>
                <input 
                  type="number" 
                  className="form-control form-control-sm" 
                  style={{ width: '70px' }} 
                  value={q.points} 
                  onChange={e => updateQuestionPoints(q.id, e.target.value)}
                />
                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => removeQuestion(q.id)}>Remove</button>
              </div>
            </div>
            
            <input 
              type="text" 
              className="form-control mb-3 fw-bold" 
              placeholder="Enter your question here..." 
              value={q.text} 
              onChange={e => updateQuestionText(q.id, e.target.value)} 
            />

            {q.type === 'mcq' && (
              <div className="options-list ms-3">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="input-group mb-2">
                    <div className="input-group-text">
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        checked={opt.is_correct} 
                        onChange={() => setCorrectOption(q.id, oIdx)} 
                      />
                    </div>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder={`Option ${oIdx + 1}`} 
                      value={opt.text} 
                      onChange={e => updateOptionText(q.id, oIdx, e.target.value)} 
                    />
                  </div>
                ))}
                <button className="btn btn-sm btn-link text-decoration-none" onClick={() => {
                  const newQuestions = [...questions]
                  newQuestions[idx].options.push({ text: '', is_correct: false })
                  setQuestions(newQuestions)
                }}>+ Add Option</button>
              </div>
            )}

            {q.type === 'true_false' && (
              <div className="d-flex gap-4 ms-3">
                <div className="form-check">
                  <input className="form-check-input" type="radio" checked={q.options[0].is_correct} onChange={() => setCorrectOption(q.id, 0)} />
                  <label className="form-check-label">True</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" checked={q.options[1].is_correct} onChange={() => setCorrectOption(q.id, 1)} />
                  <label className="form-check-label">False</label>
                </div>
              </div>
            )}

            {q.type === 'fill_blanks' && (
              <div className="ms-3">
                <label className="form-label small text-muted">Correct Answer (Automatic grading):</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="The exact word/phrase" 
                  onChange={e => {
                    const newQuestions = [...questions]
                    newQuestions[idx].options = [{ text: e.target.value, is_correct: true }]
                    setQuestions(newQuestions)
                  }}
                />
              </div>
            )}
          </div>
        ))}

        <div className="d-flex flex-wrap gap-2 mb-5 justify-content-center">
          <button className="btn btn-outline-primary" onClick={() => addQuestion('mcq')}>+ Add MCQ</button>
          <button className="btn btn-outline-primary" onClick={() => addQuestion('true_false')}>+ Add True/False</button>
          <button className="btn btn-outline-primary" onClick={() => addQuestion('fill_blanks')}>+ Add Fill Blanks</button>
          <button className="btn btn-outline-primary" onClick={() => addQuestion('essay')}>+ Add Essay</button>
        </div>

        <div className="sticky-bottom bg-white p-3 border-top d-flex justify-content-between align-items-center shadow">
          <div>
            <div className="text-muted fw-bold">{questions.length} Questions Added</div>
            <div className="text-info small fw-bold">Total Grade: {totalPoints} Points</div>
          </div>
          <div>
            {statusMessage && <span className="text-success me-3 fw-bold">{statusMessage}</span>}
            <button 
              className="btn btn-primary btn-lg px-5" 
              style={{ background: '#2b3a55', border: 'none', borderRadius: '10px' }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Publish Assignment'}
            </button>
          </div>
        </div>
      </div>

      <CircularMenu />
    </>
  )
}