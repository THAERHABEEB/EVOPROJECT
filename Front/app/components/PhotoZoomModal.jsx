'use client'

export default function PhotoZoomModal({ src, alt = 'Photo', onClose }) {
  if (!src) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        cursor: 'zoom-out',
      }}
    >
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 'min(92vw, 640px)',
          maxHeight: '92vh',
          borderRadius: '16px',
          border: '4px solid #c19a6b',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          objectFit: 'contain',
          background: '#111',
        }}
      />
    </div>
  )
}
