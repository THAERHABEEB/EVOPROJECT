'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function GradesComponent({ studentId }) {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      fetchGrades()
    }
  }, [studentId])

  const fetchGrades = async () => {
    try {
      const res = await api.grades.getByStudentId(studentId)
      if (res.status === 'success' && res.data) {
        const formattedGrades = res.data.map(g => {
          const sup = parseFloat(g.sup_grades) || 0;
          const mid = parseFloat(g.mid_grades) || 0;
          const final = parseFloat(g.final_grades) || 0;
          const totalGrade = parseFloat(g.total_grade) || 150;
          
          let percentage = null;
          // Calculate percentage only if there are some grades
          if (g.sup_grades !== null || g.mid_grades !== null || g.final_grades !== null) {
            percentage = ((sup + mid + final) / totalGrade * 100).toFixed(1);
          }

          return {
            id: g.id || g.course_id,
            subject: g.subject_name,
            sup: g.sup_grades,
            mid: g.mid_grades,
            final: g.final_grades,
            grade: g.letter_grades || '-',
            percentage: percentage
          };
        })
        setGrades(formattedGrades)
      }
    } catch (err) {
      console.error('Error fetching grades:', err)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade) => {
    const colorMap = {
      'A+': 'bg-success',
      'A': 'bg-info',
      'B': 'bg-warning',
      'C': 'bg-secondary',
      'D': 'bg-danger',
      'F': 'bg-dark'
    }
    return colorMap[grade] || 'bg-secondary'
  }

  return (
    <>
      {loading ? (
        <div className="alert alert-info">Loading grades...</div>
      ) : (
        <>
          <h2 style={{ color: '#6fc3ff', fontWeight: 'bold' }} className="mb-4">Current Semester Grades</h2>

          <div className="table-responsive">
            <table className="table table-dark table-hover text-white">
              <thead>
                <tr style={{ borderBottom: '2px solid #6fc3ff' }}>
                  <th>Subject</th>
                  <th>Assignments</th>
                  <th>Midterm</th>
                  <th>Final</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id}>
                    <td>{g.subject}</td>
                    <td>{g.sup}</td>
                    <td>{g.mid}</td>
                    <td>{g.final || '-'}</td>
                    <td>
                      <div className="progress" style={{ height: '20px', backgroundColor: '#2d2d2d' }}>
                        <div
                          className="progress-bar bg-info"
                          style={{ width: g.percentage ? `${g.percentage}%` : '0%' }}
                        >
                          {g.percentage ? `${g.percentage}%` : '-'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getGradeColor(g.grade)}`}>
                        {g.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="alert alert-info mt-4">
            <h5>Note:</h5>
            <p>Final grades will be updated after final exams</p>
          </div>
        </>
      )}
    </>
  )
}
