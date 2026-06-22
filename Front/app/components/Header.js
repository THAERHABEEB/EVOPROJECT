'use client'

import Link from 'next/link'

export default function Header({ onMenuToggle = null, showMenuButton = false, title = 'EVO Portal' }) {
  return (
    <header className="main-header" style={{
      padding: '15px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      {/* Hamburger Button - Show only on Mobile and if enabled */}
      {showMenuButton && (
        <button
          onClick={onMenuToggle}
          style={{
            position: 'absolute',
            right: '20px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6fc3ff',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'none',
            flexDirection: 'column',
            gap: '4px',
            padding: '0'
          }}
          className="hamburger-btn"
        >
          <span style={{
            width: '22px',
            height: '2.5px',
            backgroundColor: '#6fc3ff',
            borderRadius: '2px',
            transition: 'all 0.3s ease'
          }}></span>
          <span style={{
            width: '22px',
            height: '2.5px',
            backgroundColor: '#6fc3ff',
            borderRadius: '2px',
            transition: 'all 0.3s ease'
          }}></span>
          <span style={{
            width: '22px',
            height: '2.5px',
            backgroundColor: '#6fc3ff',
            borderRadius: '2px',
            transition: 'all 0.3s ease'
          }}></span>
        </button>
      )}

      {/* Logo and Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between'
      }}>
        <img 
          src="/Pics/logo.png" 
          alt="EVO"
          style={{
            height: '50px',
            width: 'auto'
          }}
        />

        {/* Page Title with Cinzel font */}
        <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
          <h1
            className="header-title"
            style={{
              margin: '0',
              fontSize: '26px',
              fontWeight: '400',
              fontFamily: "'Berkshire Swash', serif",
              fontOpticalSizing: 'auto',
              fontStyle: 'normal',
              background: 'linear-gradient(135deg, #d4af6b 0%, #f0d98a 40%, #c4a04a 70%, #e8cc7a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '2px',
              textShadow: 'none',
              filter: 'drop-shadow(0 2px 8px rgba(212,175,107,0.35))',
            }}
          >
            {title}
          </h1>
        </div>

        <img 
          src="/Pics/HITU.png" 
          alt="HITU"
          style={{
            height: '50px',
            width: 'auto'
          }}
        />
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        .main-header {
          flex-wrap: wrap;
        }

        .header-title {
          transition: letter-spacing 0.3s ease, filter 0.3s ease;
        }

        .header-title:hover {
          letter-spacing: 3px;
          filter: drop-shadow(0 2px 12px rgba(212,175,107,0.6));
        }

        @media (max-width: 767px) {
          .main-header {
            padding: 12px 15px;
          }

          .header-title {
            font-size: 16px !important;
            letter-spacing: 1px;
          }

          .main-header img {
            height: 35px;
            width: auto;
          }

          .hamburger-btn {
            display: flex !important;
          }
        }

        @media (min-width: 768px) {
          .hamburger-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}
