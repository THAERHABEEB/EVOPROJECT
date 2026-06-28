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
          aria-label="Toggle menu"
          style={{
            position: 'absolute',
            right: '12px',
            backgroundColor: 'rgba(111, 195, 255, 0.12)',
            border: '1px solid rgba(111, 195, 255, 0.35)',
            borderRadius: '10px',
            color: '#6fc3ff',
            cursor: 'pointer',
            zIndex: 1001,
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            minWidth: '44px',
            minHeight: '44px',
            padding: '10px'
          }}
          className="hamburger-btn"
        >
          <span style={{
            width: '20px',
            height: '2.5px',
            backgroundColor: '#6fc3ff',
            borderRadius: '2px',
            transition: 'all 0.3s ease'
          }}></span>
          <span style={{
            width: '20px',
            height: '2.5px',
            backgroundColor: '#6fc3ff',
            borderRadius: '2px',
            transition: 'all 0.3s ease'
          }}></span>
          <span style={{
            width: '20px',
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
            padding: 10px 56px 10px 12px !important;
          }

          .header-title {
            font-size: 15px !important;
            letter-spacing: 0.5px;
          }

          .main-header img {
            height: 32px;
            width: auto;
            max-width: 70px;
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
