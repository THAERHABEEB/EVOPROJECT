'use client'

import { useState } from 'react'
import PhotoZoomModal from '@/app/components/PhotoZoomModal'

export default function ProfileComponent({ studentInfo }) {
  const [zoomPhoto, setZoomPhoto] = useState(null)

  const info = studentInfo || {
    name: '',
    specialty: '',
    studentId: '',
    phone: '',
    address: '',
    image: 'Pics/student.jpg',
  }

  const fields = [
    { label: 'Full Name',  icon: '👤', value: info.name },
    { label: 'Student ID', icon: '🪪', value: info.studentId },
    { label: 'Specialty',  icon: '🎓', value: info.specialty },
    { label: 'Phone',      icon: '📞', value: info.phone },
    { label: 'Address',    icon: '📍', value: info.address },
  ]

  return (
    <div className="profile-page">
      <div className="profile-page__banner">
        <div className="profile-page__avatar-wrap">
          <img
            src={info.image}
            alt="Student"
            className="profile-page__avatar"
            onClick={() => setZoomPhoto(info.image)}
            title="Click to zoom"
          />
          <span className="profile-page__badge">Student</span>
        </div>
        <div className="profile-page__banner-info">
          <h2 className="profile-page__name">{info.name}</h2>
          <p className="profile-page__specialty">{info.specialty}</p>
          <p className="profile-page__id">ID: {info.studentId}</p>
        </div>
      </div>

      <div className="profile-page__grid">
        {fields.map((f) => (
          <div key={f.label} className="profile-page__card">
            <span className="profile-page__card-icon">{f.icon}</span>
            <div>
              <p className="profile-page__card-label">{f.label}</p>
              <p className="profile-page__card-value">{f.value}</p>
            </div>
          </div>
        ))}
      </div>

      <PhotoZoomModal src={zoomPhoto} alt={info.name} onClose={() => setZoomPhoto(null)} />

      <style>{`
        .profile-page { padding: 24px; max-width: 860px; }
        .profile-page__banner {
          display: flex; align-items: center; gap: 30px;
          background: rgba(255,255,255,0.06); backdrop-filter: blur(14px);
          border: 1px solid rgba(193,154,107,0.35); border-radius: 20px;
          padding: 28px 32px; margin-bottom: 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35); flex-wrap: wrap;
        }
        .profile-page__avatar-wrap { position: relative; flex-shrink: 0; }
        .profile-page__avatar {
          width: 110px; height: 110px; border-radius: 50%; object-fit: cover;
          border: 4px solid #c19a6b; box-shadow: 0 0 20px rgba(193,154,107,0.5);
          cursor: zoom-in; transition: transform 0.25s ease;
        }
        .profile-page__avatar:hover { transform: scale(1.05); }
        .profile-page__badge {
          position: absolute; bottom: 4px; right: 0;
          background: linear-gradient(135deg,#a07840,#c19a6b); color: #000;
          font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px;
        }
        .profile-page__name {
          font-size: 1.7rem; font-weight: 700; margin: 0 0 6px;
          background: linear-gradient(to right, #c19a6b, #e0c99a);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .profile-page__specialty { color: rgba(255,255,255,0.75); margin: 0 0 4px; }
        .profile-page__id { color: #c19a6b; font-size: 0.85rem; font-weight: 600; margin: 0; }
        .profile-page__grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;
        }
        .profile-page__card {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(193,154,107,0.2);
          border-radius: 14px; padding: 18px 20px;
        }
        .profile-page__card-label {
          font-size: 0.72rem; color: rgba(255,255,255,0.5); text-transform: uppercase; margin: 0 0 3px;
        }
        .profile-page__card-value { font-size: 0.98rem; color: #c19a6b; font-weight: 600; margin: 0; }
        @media (max-width: 600px) {
          .profile-page__banner { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  )
}
