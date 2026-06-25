import '../styles/globals.css'
import '../styles/font.css'
import '../styles/theme.css'
import '../styles/animations.css'
import '../styles/carousel.css'
import '../styles/forms.css'
import '../styles/login.css'
import '@/styles/bootstrap.min.css'

export const metadata = {
  title: 'EVO PROJECT (Smart Campus System)',
  description: 'The EVO Project (Smart Campus System) is an
integrated digital platform designed to modernize
university operations by merging academic, administrative, and security services into a single, centralized hub. Developed as a Bachelor of Science
graduation project in Data Science at Helwan
International Technological University (HITU), the
system streamlines campus life through automated
ID-card attendance tracking, interactive Blender- modeled 3D indoor navigation, secure internal
communication networks, and role-based
administrative dashboards. Built using a robust full- stack architecture of React.js, Node.js, Express.js, and MySQL .',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* ✏️ Font import location — change the font here */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&family=Cinzel:wght@400..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="cursor-glow" className="cursor-glow"></div>
        {children}
      </body>
    </html>
  )
}
