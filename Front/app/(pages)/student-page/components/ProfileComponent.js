'use client'
import { UserIcon, IdCardIcon, GraduationIcon, PhoneIcon, LocationIcon } from '@/app/components/Icons'

export default function ProfileComponent({ studentInfo }) {
  const info = studentInfo || {
    name: 'Abdulrahman Reda Kamel',
    specialty: 'Data Science - Year 2',
    studentId: '247818',
    phone: '0155984249',
    address: '10th of Ramadan',
    image: '/Pics/student.jpg',
  }

  const fields = [
    { label: 'Full Name',  icon: <UserIcon size={24} color="#c19a6b" />,       value: info.name },
    { label: 'Student ID', icon: <IdCardIcon size={24} color="#c19a6b" />,     value: info.studentId },
    { label: 'Specialty',  icon: <GraduationIcon size={24} color="#c19a6b" />, value: info.specialty },
    { label: 'Phone',      icon: <PhoneIcon size={24} color="#c19a6b" />,      value: info.phone },
    { label: 'Address',    icon: <LocationIcon size={24} color="#c19a6b" />,   value: info.address },
  ]

  return (
    <div className="profile-page">
      {/* Avatar + name banner */}
      <div className="profile-page__banner">
        <div className="profile-page__avatar-wrap">
          <img
            src={info.image}
            alt="Student"
            className="profile-page__avatar"
            onError={(e) => { e.target.onerror = null; e.target.src = '/Pics/student.jpg'; }}
          />
          <span className="profile-page__badge">Student</span>
        </div>
        <div className="profile-page__banner-info">
          <h2 className="profile-page__name">{info.name}</h2>
          <p className="profile-page__specialty">{info.specialty}</p>
          <p className="profile-page__id">ID: {info.studentId}</p>
        </div>
      </div>

      {/* Info cards grid */}
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

      <style>{`
        .profile-page {
          padding: 24px;
          max-width: 860px;
        }

        /* ── Banner ── */
        .profile-page__banner {
          display: flex;
          align-items: center;
          gap: 30px;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(193,154,107,0.35);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
          flex-wrap: wrap;
        }

        /* Avatar */
        .profile-page__avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .profile-page__avatar {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #c19a6b;
          box-shadow: 0 0 20px rgba(193,154,107,0.5);
        }
        .profile-page__badge {
          position: absolute;
          bottom: 4px;
          right: 0;
          background: linear-gradient(135deg,#a07840,#c19a6b);
          color: #000;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* Banner text */
        .profile-page__banner-info { flex: 1; }
        .profile-page__name {
          font-size: 1.7rem;
          font-weight: 700;
          background: linear-gradient(to right, #c19a6b, #e0c99a);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 6px;
        }
        .profile-page__specialty {
          color: rgba(255,255,255,0.75);
          font-size: 0.95rem;
          margin: 0 0 4px;
        }
        .profile-page__id {
          color: #c19a6b;
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
          letter-spacing: 0.05em;
        }

        /* ── Info cards grid ── */
        .profile-page__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .profile-page__card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(193,154,107,0.2);
          border-radius: 14px;
          padding: 18px 20px;
          transition: all 0.3s ease;
        }
        .profile-page__card:hover {
          border-color: rgba(193,154,107,0.55);
          background: rgba(193,154,107,0.08);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        .profile-page__card-icon {
          font-size: 1.6rem;
          flex-shrink: 0;
        }
        .profile-page__card-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 3px;
        }
        .profile-page__card-value {
          font-size: 0.98rem;
          color: #c19a6b;
          font-weight: 600;
          margin: 0;
        }

        @media (max-width: 600px) {
          .profile-page { padding: 14px; }
          .profile-page__banner { flex-direction: column; text-align: center; padding: 20px; }
          .profile-page__name { font-size: 1.3rem; }
          .profile-page__grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
