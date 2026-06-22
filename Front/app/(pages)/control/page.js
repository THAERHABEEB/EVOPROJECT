'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import api from '@/lib/api'
import { departments, getYearsByDepartment, getSubjectsByYear } from '@/lib/roadmapData'

export default function ControlPage() {

  const [department, setDepartment] = useState(departments[0]?.name || '')
  const [year, setYear] = useState('')
  const [course, setCourse] = useState('')

  // Update year and course when department changes
  useEffect(() => {
    if (department) {
      const years = getYearsByDepartment(department)
      if (years.length > 0) {
        setYear(years[0].id)
      }
    }
  }, [department])

  // Update course when year or department changes
  useEffect(() => {
    if (department && year) {
      const subjects = getSubjectsByYear(department, year)
      if (subjects.length > 0) {
        setCourse(subjects[0].id)
      }
    }
  }, [department, year])
  const [tableData, setTableData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [currentRecord, setCurrentRecord] = useState(null) // Stores metadata from upload_grades table

  // Load SheetJS from CDN once
  useEffect(() => {
    if (window.XLSX) return
    const script = document.createElement('script')
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'
    document.head.appendChild(script)
  }, [])

  const handleSearch = async () => {
    if (!course) return
    setLoading(true)
    setTableData(null)
    setCurrentRecord(null)
    setUploadStatus('Searching for grades...')

    try {
      // 1. Fetch metadata from upload_grades table
      const response = await api.uploadGrades.getAll({ course_id: course })
      if (!response.data || response.data.length === 0) {
        setUploadStatus('No pending grades found for this course.')
        setLoading(false)
        return
      }

      const record = response.data[0] // Take the most recent/first one
      setCurrentRecord(record)

      // 2. Fetch CSV file from public directory
      // Path format: /${folder}/${file_name}
      const filePath = `/${record.folder}/${record.file_name}`
      setUploadStatus(`Loading file: ${record.file_name}...`)

      const fileResponse = await fetch(filePath)
      if (!fileResponse.ok) throw new Error('Could not find the grade file in storage.')

      const csvText = await fileResponse.text()

      // 3. Parse CSV (Manual split as used before)
      const lines = csvText.trim().split('\n').map((l) => l.split(',').map((c) => c.trim()))
      const headers = lines[0]
      const rows = lines.slice(1)

      setTableData({ headers, rows })
      setUploadStatus('')
    } catch (error) {
      console.error('Error fetching grades:', error)
      setUploadStatus(error.message || 'Failed to fetch grades.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!currentRecord) return
    try {
      setUploadStatus(`Updating status to ${newStatus}...`)
      await api.uploadGrades.update(currentRecord.id, { 
        ...currentRecord,
        status: newStatus 
      })
      setCurrentRecord(prev => ({ ...prev, status: newStatus }))
      setUploadStatus(`Grades ${newStatus} successfully!`)
      setTimeout(() => setUploadStatus(''), 3000)
    } catch (error) {
      console.error('Error updating status:', error)
      setUploadStatus('Failed to update status.')
    }
  }

  return (
    <>
      <Header title="Control Panel" />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundImage: "url('/Pics/backlogo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 20px',
      }}>

      <div style={{
        width: '100%',
        maxWidth: '900px',
        padding: '40px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}>

        <h1 style={{ textAlign: 'center', color: '#0b3a6e', marginBottom: '30px' }}>
          Control Panel
        </h1>

        {/* Dropdowns */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
        }}>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} style={dropdownStyle}>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} style={dropdownStyle}>
            {getYearsByDepartment(department).map((y) => (
              <option key={y.id} value={y.id}>{y.label}</option>
            ))}
          </select>

          <select value={course} onChange={(e) => setCourse(e.target.value)} style={dropdownStyle}>
            {getSubjectsByYear(department, year).map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <button 
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '12px 30px',
              border: 'none',
              borderRadius: '10px',
              background: 'linear-gradient(90deg,#0b3a6e,#1a5fa8)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            {loading ? 'Searching...' : '🔍 Search Grades'}
          </button>
        </div>

        {uploadStatus && (
          <p style={{ textAlign: 'center', color: '#0b3a6e', fontWeight: 'bold', marginBottom: '20px' }}>
            {uploadStatus}
          </p>
        )}

        {/* File Info & Status Bar */}
        {currentRecord && (
          <div style={{
            marginTop: '20px',
            padding: '14px 20px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '22px' }}>📄</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#0b3a6e' }}>{currentRecord.file_name}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                Status: <span style={{ 
                  fontWeight: 'bold', 
                  color: currentRecord.status === 'Approved' ? '#27ae60' : 
                         currentRecord.status === 'Rejected' ? '#c0392b' : '#f39c12' 
                }}>{currentRecord.status}</span>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleStatusUpdate('Approved')}
                disabled={currentRecord.status === 'Approved'}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  background: '#27ae60',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: currentRecord.status === 'Approved' ? 0.6 : 1
                }}
              >✓ Approve</button>
              
              <button
                onClick={() => handleStatusUpdate('Rejected')}
                disabled={currentRecord.status === 'Rejected'}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  background: '#c0392b',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: currentRecord.status === 'Rejected' ? 0.6 : 1
                }}
              >✕ Reject</button>
            </div>
          </div>
        )}

        {/* Table Preview */}
        {tableData && (
          <div style={{
            marginTop: '25px',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              background: 'linear-gradient(90deg,#0b3a6e,#1a5fa8)',
              padding: '14px 20px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '15px',
            }}>
              📋 File Preview — {tableData.rows.length} row{tableData.rows.length !== 1 ? 's' : ''}
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'rgba(255,255,255,0.95)',
                fontSize: '14px',
              }}>
                <thead>
                  <tr>
                    {tableData.headers.map((h, i) => (
                      <th key={i} style={{
                        padding: '12px 16px',
                        background: 'rgba(202,161,60,0.15)',
                        color: '#0b3a6e',
                        borderBottom: '2px solid #caa13c',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        position: 'sticky',
                        top: 0,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, ri) => (
                    <tr key={ri} style={{
                      background: ri % 2 === 0 ? 'white' : 'rgba(202,161,60,0.05)',
                    }}>
                      {tableData.headers.map((_, ci) => (
                        <td key={ci} style={{
                          padding: '10px 16px',
                          borderBottom: '1px solid rgba(0,0,0,0.07)',
                          color: '#333',
                          whiteSpace: 'nowrap',
                        }}>
                          {row[ci] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      </div>
      <CircularMenu />
    </>
  )
}

const dropdownStyle = {
  padding: '12px',
  borderRadius: '10px',
  border: 'none',
  width: '200px',
  background: 'rgba(255,255,255,0.8)',
}
