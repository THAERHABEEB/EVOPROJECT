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
    fetchStudentInfo()
    setIsClient(true)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    // Set initial state on mount
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
