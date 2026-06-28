'use client'

import dynamic from 'next/dynamic'

const CldUploadWidget = dynamic(
  () => import('next-cloudinary').then((mod) => mod.CldUploadWidget),
  {
    ssr: false,
    loading: () => (
      <div
        className="p-5 text-center d-flex flex-column justify-content-center"
        style={{
          minHeight: '280px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.3))',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.8)',
        }}
      >
        <p style={{ color: '#555', fontWeight: 500 }}>Loading upload widget...</p>
      </div>
    ),
  }
)

export default function CloudinaryUploadZone({
  onSuccess,
  selectedCourseId,
  onMissingCourse,
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    return (
      <div
        className="p-5 text-center d-flex flex-column justify-content-center"
        style={{
          minHeight: '280px',
          background: 'rgba(255,243,224,0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(196,161,107,0.4)',
        }}
      >
        <i className="bi bi-exclamation-triangle" style={{ fontSize: '2.5rem', color: '#c4a16b' }}></i>
        <h4 style={{ color: '#2b3a55', marginTop: '16px' }}>Video upload unavailable</h4>
        <p style={{ color: '#666', marginBottom: 0 }}>
          Cloudinary is not configured. Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> in Vercel.
        </p>
      </div>
    )
  }

  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary/sign"
      onSuccess={onSuccess}
      options={{
        multiple: false,
        resourceType: 'video',
        folder: 'evo_lectures',
      }}
    >
      {({ open }) => (
        <div
          className="p-5 text-center position-relative h-100 d-flex flex-column justify-content-center upload-area-animated"
          onClick={(e) => {
            e.preventDefault()
            if (!selectedCourseId) {
              onMissingCourse()
              return
            }
            open()
          }}
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.3))',
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: '16px',
            textAlign: 'center',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "url('/Pics/11.png')",
              opacity: 0.3,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '16px',
              backgroundBlendMode: 'overlay',
            }}
          ></div>
          <div className="position-relative z-1">
            <i className="bi bi-camera-video" style={{ fontSize: '4.5rem', color: '#c4a16b' }}></i>
            <h3 style={{ color: '#2b3a55', marginTop: '20px', marginBottom: '10px', fontWeight: 600 }}>
              Click to Upload Video
            </h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#555', fontWeight: 500 }}>
              Powered by Cloudinary
            </p>
            <div
              className="d-inline-block px-4 py-2 mb-3"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '8px',
                color: '#777',
                fontWeight: 500,
              }}
            >
              MP4 <span className="mx-2">|</span> MKV <span className="mx-2">|</span> AVI , MOV
            </div>
            <div>
              <button
                type="button"
                className="btn mt-3 px-5 py-3"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  background: 'linear-gradient(to right, #6b829c, #8ca3ba)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 10px rgba(107,130,156,0.2)',
                }}
              >
                <i className="bi bi-cloud-arrow-up me-2"></i> Select Video
              </button>
            </div>
          </div>
        </div>
      )}
    </CldUploadWidget>
  )
}
