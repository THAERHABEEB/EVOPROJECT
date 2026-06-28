'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import '@/styles/bootstrap.min.css'
import '@/styles/zeus.css'
import '@/styles/theme.css'

export default function FAQPage() {
  const [openFAQ, setOpenFAQ] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [canManageFaq, setCanManageFaq] = useState(false)
  
  const initialFaqs = [
    {
      id: 1,
      question: 'أين يوجد مكتب شؤون الطلبة؟',
      answer: 'يقع مكتب شؤون الطلبة داخل المبنى الرئيسي بجوار مكتب شؤون الموظفين.',
      status: 'answered'
    },
    {
      id: 2,
      question: 'كيف أدفع رسوم الكلية؟',
      answer: '1. الذهاب الى صفحة شؤون الطلبة\n2. اختر "دفع المصاريف"\n3. اختر طريقة الدفع\n4. سجل الطلب و انتظر حتى تأتيك رسالة تأكيد',
      status: 'answered'
    },
    {
      id: 3,
      question: 'كيف أحمل محاضراتي؟',
      answer: 'يمكنك الذهاب إلى قسم المحاضرات واختيار المادة التي تريد، ثم تحميل المحاضرات المتاحة.',
      status: 'answered'
    },
    {
      id: 4,
      question: 'هل يمكنني تعديل بيانات ملفي الشخصي؟',
      answer: 'نعم، يمكنك تعديل بيانات ملفك الشخصي من قسم "الملف الشخصي" بالذهاب إلى صفحتك الشخصية.',
      status: 'answered'
    },
    {
      id: 5,
      question: 'كيف أتواصل مع المدرسين؟',
      answer: 'يمكنك التواصل مع المدرسين عبر البريد الجامعي أو من خلال قسم الرسائل في صفحتك الشخصية.',
      status: 'answered'
    },
    {
      id: 6,
      question: 'ما هي مواعيد الامتحانات؟',
      answer: 'مواعيد الامتحانات يتم إعلانها في بداية الفصل الدراسي عبر البريد الجامعي والموقع الرسمي.',
      status: 'answered'
    }
  ]

  const [faqs, setFaqs] = useState([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const role = (localStorage.getItem('userRole') || '').toLowerCase()
    setCanManageFaq(role === 'control' || role === 'admin')
    const storedFaqs = localStorage.getItem('evo_faqs')
    if (storedFaqs) {
      setFaqs(JSON.parse(storedFaqs))
    } else {
      setFaqs(initialFaqs)
      localStorage.setItem('evo_faqs', JSON.stringify(initialFaqs))
    }
  }, [])

  const saveFaqs = (newFaqs) => {
    setFaqs(newFaqs)
    localStorage.setItem('evo_faqs', JSON.stringify(newFaqs))
  }

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  const handleAddQuestion = (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    const newFaq = {
      id: Date.now(),
      question: newQuestion,
      answer: '',
      status: 'pending'
    }

    saveFaqs([...faqs, newFaq])
    setNewQuestion('')
    alert('Your question has been submitted successfully, and will appear as an answer once the administration replies.')
  }

  const handleAnswerQuestion = (id, answerText) => {
    // When answered, push it to top. So we just update the answer,
    // order is determined by id (newest ids first) or we could unshift
    const updated = faqs.map(faq => {
      if (faq.id === id) {
        return { ...faq, answer: answerText, status: 'answered' }
      }
      return faq
    })
    saveFaqs(updated)
  }

  const handleDeleteQuestion = (id) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updated = faqs.filter(faq => faq.id !== id)
      saveFaqs(updated)
    }
  }

  if (!isClient) return null

  // Order answered FAQs: latest answered questions appear at the top
  const answeredFaqs = faqs.filter(f => f.status === 'answered').sort((a, b) => b.id - a.id)
  const pendingFaqs = faqs.filter(f => f.status === 'pending').sort((a, b) => a.id - b.id)

  const filteredAnswered = answeredFaqs.filter(faq => 
    faq.question.includes(searchQuery) || (faq.answer && faq.answer.includes(searchQuery))
  )

  const showNotFound = searchQuery && filteredAnswered.length === 0

  return (
    <>
      <Header title="FAQ" />
      <div id="cursor-glow"></div>
      
      {/* Admin toggle — only for control / admin users */}
      {canManageFaq && (
        <div className="position-fixed top-0 end-0 p-3 faq-admin-toggle" style={{ zIndex: 9999, marginTop: '70px' }}>
          <button 
            className={`btn btn-sm shadow ${isAdmin ? 'btn-danger' : 'btn-outline-light'}`}
            onClick={() => setIsAdmin(!isAdmin)}
            style={{
              backdropFilter: 'blur(5px)',
              background: isAdmin ? '#dc3545' : 'rgba(255,255,255,0.1)'
            }}
          >
            {isAdmin ? '🔴 Exit Admin Mode' : '🛡️ Admin Mode'}
          </button>
        </div>
      )}

      <div className="container-fluid py-5" style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10" dir="ltr">

            <div className="text-center mb-5">
              <h1 className="text-white mb-3" style={{ fontWeight: 'bold' }}>Frequently Asked Questions</h1>
            </div>

            {/* Search Box */}
            <div className="search-container mb-5">
              <div className="input-group input-group-lg" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)'
              }}>
                <span className="input-group-text bg-transparent border-0 text-white px-4">
                  🔍
                </span>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 text-white shadow-none ps-2" 
                  placeholder="Search for your question here..."
                  aria-label="Search FAQs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ color: '#fff', fontSize: '1.1rem' }}
                />
              </div>
            </div>

            {/* Answered FAQ Items */}
            <div id="faqContainer">
              {filteredAnswered.map((faq) => (
                <div key={faq.id} className="faq-box mb-3" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                  marginBottom: '1rem'
                }} onClick={() => toggleFAQ(faq.id)}>
                  <div className="question d-flex justify-content-between align-items-center" style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '500' }}>
                    <span style={{ textAlign: 'right', flex: 1, direction: 'rtl' }}>{faq.question}</span>
                    <span className="toggle-icon ms-3" style={{
                      transform: openFAQ === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: '#d29505',
                      fontSize: '1.5rem',
                      lineHeight: '1'
                    }}>▼</span>
                  </div>
                  
                  {openFAQ === faq.id && (
                    <div className="answer show mt-4" style={{ 
                      color: 'rgba(255, 255, 255, 0.85)', 
                      fontSize: '1.05rem', 
                      lineHeight: '1.8',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                      paddingTop: '20px',
                      textAlign: 'right', // Keep answers right-aligned since they are in Arabic
                      direction: 'rtl'
                    }}>
                      {faq.answer.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                      
                      {canManageFaq && isAdmin && (
                        <div className="mt-4 pt-3 text-end" style={{ borderTop: '1px dashed rgba(255,0,0,0.2)' }}>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(faq.id); }}
                          >
                            Delete this question
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {showNotFound && (
                <div id="noResults" className="alert text-center mt-4" role="alert" style={{
                  background: 'rgba(210, 149, 5, 0.1)',
                  border: '1px solid rgba(210, 149, 5, 0.3)',
                  color: '#fff',
                  borderRadius: '12px',
                  backdropFilter: 'blur(5px)'
                }}>
                  <strong style={{ color: '#d29505' }}>No results found!</strong><br />
                  Try searching with different keywords or add your question below for the administration to answer.
                </div>
              )}
            </div>

            {/* Added functionality to ask new questions */}
            <div className="mt-5 p-4" style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              backdropFilter: 'blur(5px)'
            }}>
              <h4 className="text-white mb-4" style={{ fontSize: '1.3rem' }}>Question not found? Ask it now</h4>
              <form onSubmit={handleAddQuestion}>
                <div className="input-group d-flex faq-ask-row" style={{ gap: '10px' }}>
                  <input 
                    type="text" 
                    className="form-control bg-transparent text-white shadow-none ps-3 text-end" 
                    placeholder="Write your question clearly here..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      direction: 'rtl',
                      padding: '12px 20px',
                      flex: 1
                    }}
                  />
                  <button type="submit" className="btn px-4" style={{ 
                    background: 'rgba(210, 149, 5, 0.8)', 
                    color: '#000', 
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(210, 149, 5, 0.5)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#d29505'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(210, 149, 5, 0.8)'}
                  >
                    Submit
                  </button>
                </div>
                <small className="text-muted mt-2 d-block">The question will be reviewed by the administration and will appear here once answered.</small>
              </form>
            </div>

            {/* Admin Section for Pending Questions */}
            {(canManageFaq && isAdmin && pendingFaqs.length > 0) && (
              <div className="mt-5 mb-5 p-4" style={{
                background: 'rgba(220, 53, 69, 0.05)',
                border: '1px solid rgba(220, 53, 69, 0.3)',
                borderRadius: '16px'
              }}>
                <h4 className="text-danger mb-4" style={{ borderBottom: '1px solid rgba(220, 53, 69, 0.2)', paddingBottom: '15px' }}>
                  ⚙️ Admin Dashboard: Pending Questions ({pendingFaqs.length})
                </h4>
                
                {pendingFaqs.map(faq => (
                  <div key={faq.id} className="faq-box mb-4 p-4" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px'
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 text-white">
                      <span className="badge bg-danger px-3 py-2 rounded-pill">Pending</span>
                      <span className="fw-bold" style={{ fontSize: '1.1rem', textAlign: 'right', direction: 'rtl', flex: 1, paddingRight: '15px' }}>Q: {faq.question}</span>
                    </div>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAnswerQuestion(faq.id, e.target.answer.value);
                    }}>
                      <textarea 
                        name="answer" 
                        className="form-control bg-transparent text-white shadow-none mb-3 p-3 text-end" 
                        rows="3"
                        placeholder="Write the answer here to be published..."
                        required
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          direction: 'rtl'
                        }}
                      ></textarea>
                      <div className="d-flex justify-content-start gap-3">
                        <button type="submit" className="btn px-4" style={{ background: '#d29505', color: '#000', fontWeight: 'bold' }}>
                          Publish Answer
                        </button>
                        <button type="button" className="btn btn-outline-danger px-4" onClick={() => handleDeleteQuestion(faq.id)}>
                          Reject & Delete
                        </button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Feedback for normal users */}
            {(!canManageFaq && pendingFaqs.length > 0) && (
              <div className="mt-4 text-center">
                <p className="text-white-50 p-3" style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '12px',
                  border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                  There are {pendingFaqs.length} questions pending review by the administration.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
      <CircularMenu />
    </>
  )
}
