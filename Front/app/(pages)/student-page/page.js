'use client'
import CircularMenu from '../../components/CircularMenu';
import '@/styles/student.css'
import '@/styles/bootstrap.min.css'
import '@/styles/zeus.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import GradesComponent from './components/GradesComponent'
import LecturesComponent from './components/LecturesComponent'
import ActivitiesComponent from './components/ActivitiesComponent'
import StatisticsComponent from './components/StatisticsComponent'
import AssignmentsComponent from './components/AssignmentsComponent'
import PaymentsComponent from './components/PaymentsComponent'
import RoadmapComponent from './components/RoadmapComponent'
import ProfileComponent from './components/ProfileComponent'
import {
  ChartBarIcon, VideoIcon, TargetIcon, TrendUpIcon,
  CheckCircleIcon, MapIcon, CreditCardIcon
} from '@/app/components/Icons'
import { api } from '@/lib/api'

export default function StudentPage() {
  const router = useRouter()
  const [studentInfo, setStudentInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)

  const fetchStudentInfo = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error('No userId found in localStorage')
        router.push('/login')
        return
      }

      const res = await api.students.getByUserId(userId)
      if (res.status === 'success' && res.data) {
        const data = res.data
        let photoUrl = data.photo || '/Pics/student.jpg';
        if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('/')) {
          photoUrl = '/' + photoUrl;
        }
        setStudentInfo({
          name: data.name,
          specialty: `${data.department || ''}${data.year_level ? ` - Year ${data.year_level}` : ''}`,
          studentId: data.id,
          phone: data.phone,
          address: data.address,
          image: photoUrl
        })
        // If specialization is not set, send student to selection page (first-time only)
        if (!data.department) {
          router.push('/student-page/select-specialization')
          return
        }
      }
    } catch (error) {
      console.error('Error fetching student info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsClient(true)
    const handleResize = () => setIsDesktop(window.innerWidth > 992)
    handleResize()
    window.addEventListener('resize', handleResize)

    if (!localStorage.getItem('studentInstructionsViewed')) {
      setShowInstructions(true)
    }

    fetchStudentInfo()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const closeInstructions = () => {
    localStorage.setItem('studentInstructionsViewed', 'true')
    setShowInstructions(false)
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('studentToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('token')
      sessionStorage.clear()
      router.push('/login')
    }
  }

  const navItems = [
    { label: 'Grades', id: 'grades', icon: <ChartBarIcon size={18} /> },
    { label: 'Lectures', id: 'lectures', icon: <VideoIcon size={18} /> },
    { label: 'Activities', id: 'activities', icon: <TargetIcon size={18} /> },
    { label: 'Statistics', id: 'statistics', icon: <TrendUpIcon size={18} /> },
    { label: 'Assignments', id: 'assignments', icon: <CheckCircleIcon size={18} /> },
    { label: 'Roadmap', id: 'roadmap', icon: <MapIcon size={18} /> },
    { label: 'Payments', id: 'payments', icon: <CreditCardIcon size={18} /> },
  ]

  const renderComponent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileComponent studentInfo={studentInfo} />
      case 'grades':
        return <GradesComponent studentId={studentInfo?.studentId} />
      case 'lectures':
        return <LecturesComponent />
      case 'activities':
        return <ActivitiesComponent />
      case 'statistics':
        return <StatisticsComponent />
      case 'assignments':
        return <AssignmentsComponent />
      case 'roadmap':
        return <RoadmapComponent />
      case 'payments':
        return <PaymentsComponent />
      default:
        return <ProfileComponent studentInfo={studentInfo} />
    }
  }

  return (
    <>
      {showInstructions && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.5s ease'
        }}>
          <div style={{
            background: '#1a1a2e', padding: '40px 30px', borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.1)', maxWidth: '500px', width: '90%',
            color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', textAlign: 'center',
            position: 'relative'
          }}>
            <h2 style={{ marginBottom: '15px', color: '#4facfe', fontSize: '24px' }}>Welcome to Student Portal</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '25px', color: '#ccc' }}>Here is a quick overview of your navigation bar:</p>
            <ul style={{ listStyleType: 'none', lineHeight: '2.0', marginBottom: '30px', textAlign: 'left', paddingLeft: '10px', color: '#e0e0e0', fontSize: '16px' }}>
              <li>➔ <strong>Grades:</strong> Track your academic performance.</li>
              <li>➔ <strong>Lectures:</strong> Access your course materials and videos.</li>
              <li>➔ <strong>Activities:</strong> Participate in student events and tasks.</li>
              <li>➔ <strong>Statistics:</strong> View detailed charts of your progress.</li>
              <li>➔ <strong>Assignments:</strong> Submit and manage your coursework.</li>
              <li>➔ <strong>Roadmap:</strong> Follow your academic timeline.</li>
              <li>➔ <strong>Payments:</strong> Manage your tuition and fees.</li>
            </ul>
            <button 
              onClick={closeInstructions}
              style={{
                width: '100%', padding: '14px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      )}
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
        title="Student Portal"
      />
      <div id="cursor-glow"></div>

      {/* Sidebar Overlay - Mobile Only */}


      {/* Desktop Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', width: '100%' }}>
        <div className="sidebar" style={{
          width: isDesktop ? '320px' : '280px',
          position: isDesktop ? 'relative' : 'fixed',
          right: 0,
          top: isDesktop ? '0' : '70px',
          height: isDesktop ? 'auto' : 'calc(100vh - 70px)',
          backgroundColor: '#1a1a2e',
          zIndex: isDesktop ? 'auto' : '1001',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          transform: !isDesktop && !sidebarOpen ? 'translateX(200%)' : 'translateX(0)',
          transition: !isDesktop ? 'transform 0.3s ease' : 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div
            className={`profile${activeTab === 'profile' ? ' profile--active' : ''}`}
            onClick={() => {
              setActiveTab('profile')
              if (!isDesktop) setSidebarOpen(false)
            }}
            title="View full profile"
          >
            <img 
              src={studentInfo?.image || '/Pics/student.jpg'} 
              alt="Student" 
              onError={(e) => { e.target.onerror = null; e.target.src = '/Pics/student.jpg'; }}
            />
            <div>
              <strong>{studentInfo?.name || 'Abdulrahman Reda Kamel'}</strong><br />
              <small>{studentInfo?.specialty || 'Data Science - Year 2'}</small>
            </div>
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                if (!isDesktop) {
                  setSidebarOpen(false)
                }
              }}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              style={{
                backgroundColor: activeTab === item.id ? '#d29505ff' : 'transparent',
                color: activeTab === item.id ? '#000' : '#fff',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                padding: !isDesktop ? '12px 15px' : '14px 18px',
                textAlign: 'right',
                fontSize: !isDesktop ? '13px' : '15px',
                transition: 'all 0.3s ease',
                fontWeight: '500'
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <button
            onClick={(e) => {
              e.preventDefault()
              handleLogout()
            }}
            className="menu-item"
            style={{
              marginTop: 'auto',
              color: '#ff6b6b',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              width: '100%',
              padding: '12px 15px',
              textAlign: 'right',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>

        <div className="main-content" style={{
          flex: 1,
          overflow: 'auto',
          padding: !isDesktop ? '15px' : '20px',
          width: '100%',
          minHeight: '100%'
        }}>
          {isLoading ? (
            <div className="alert alert-info">Loading data...</div>
          ) : (
            <>
              {renderComponent()}
            </>
          )}
        </div>
      </div>

      {/* Global Responsive Styles */}
      <style>{`
        @media (max-width: 767px) {
          .main-content {
            padding: 12px;
          }

          .main-content h2,
          .main-content h3 {
            font-size: 18px !important;
            margin-bottom: 15px !important;
          }

          .main-content table {
            font-size: 12px;
          }

          .main-content .table th,
          .main-content .table td {
            padding: 8px 4px !important;
          }

          .main-content .card {
            margin-bottom: 10px !important;
            padding: 12px !important;
          }

          .main-content .btn {
            padding: 6px 10px !important;
            font-size: 12px !important;
          }

          .main-content input,
          .main-content select,
          .main-content textarea {
            font-size: 14px !important;
            padding: 8px !important;
          }

          .main-content .container {
            padding: 0 !important;
          }

          .main-content .row {
            margin-left: -6px !important;
            margin-right: -6px !important;
          }

          .main-content [class*='col-'] {
            padding-left: 6px !important;
            padding-right: 6px !important;
          }
        }

        @media (min-width: 768px) {
          .main-content {
            padding: 20px;
          }
        }
      `}</style>

      <CircularMenu />
    </>
  )
}
