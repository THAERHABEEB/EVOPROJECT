// app/page.jsx  أو src/app/page.jsx
'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
// import NewsCarousel from './components/NewsCarousel'   ← لو لسه موجود خليه، لو مش عايزه شيله
import Header from './components/Header'
import CircularMenu from './components/CircularMenu'

// Scroll-triggered fade-up animation wrapper
function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = `opacity 0.9s ease ${delay}ms, transform 0.9s ease ${delay}ms`
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(48px)' }}>
      {children}
    </div>
  )
}

const departments = [
  {
    id: 1,
    name: 'Data Science',
    image: '/Pics/Data Science.jpg',
    overview:
      'Data Science is one of the most modern and fundamental disciplines of the digital age. It focuses on studying and analyzing large datasets using advanced scientific methods to extract patterns and insights that help organizations make precise decisions. The field combines statistics, programming, artificial intelligence, and machine learning to build predictive models and solve complex problems across various industries.',
    subsections: []
  },
  {
    id: 2,
    name: 'Cybersecurity',
    image: '/Pics/CS.png',
    overview:
      'Focuses on protecting systems, networks, and data from digital attacks. Students learn to discover vulnerabilities, prevent risks, and secure digital infrastructure using the latest encryption and forensics tools.',
    subsections: [],
  },
  {
    id: 3,
    name: 'Artificial Intelligence',
    image: '/Pics/AI.png',
    overview:
      'One of the fastest-growing fields worldwide. Students build intelligent systems capable of learning, decision-making, and data analysis using machine learning, deep learning, and computer vision.',
    subsections: [],
  },
  {
    id: 4,
    name: 'Mechatronics Technology Department',
    image: '/Pics/mechatronics.png',
    overview:
      'Combines mechanics, electronics, control systems, and robotics. It is one of the most in-demand specializations for smart production lines and automated factories.',
    subsections: [],
  },
  {
    id: 5,
    name: 'Electrical Technology Department',
    image: '/Pics/electrical.png',
    overview:
      'Focuses on electrical systems, energy, control, and electronic circuits. Strong job market in electrical companies, power stations, and industrial sectors.',
    subsections: [],
  },
  {
    id: 6,
    name: 'Mechanical Technology Department',
    image: '/Pics/mechanical.png',
    overview:
      'Qualifies students in the design, operation, and maintenance of mechanical systems. Among the most demanded fields in heavy and engineering industries.',
    subsections: [],
  },
  {
    id: 7,
    name: 'Production & Industrial Technology Department',
    image: '/Pics/production.png',
    overview:
      'Concerned with managing and operating production lines and improving product quality. In demand in large factories and manufacturing and industrial operations.',
    subsections: [],
  },
  {
    id: 8,
    name: 'Energy Technology Department',
    image: '/Pics/energy.png',
    overview:
      'Studies traditional and renewable energy systems such as solar and wind energy. The energy job market is currently experiencing very significant expansion.',
    subsections: [],
  },
  {
    id: 9,
    name: 'Operation & Maintenance Technology Department',
    image: '/Pics/maintenance.png',
    overview:
      'Prepares students to work in the maintenance of industrial equipment and machinery according to modern standards. A critical specialization in all factories and engineering projects.',
    subsections: [],
  },
]

const newsItems = [
  {
    id: 1,
    title: 'HITU Launches New AI Research Lab',
    text: 'Helwan International Technological University proudly announces the inauguration of its state-of-the-art Artificial Intelligence Research Lab, equipped with the latest GPU clusters and deep learning infrastructure to support student and faculty research projects.',
    image: '/Pics/AI.png',
  },
  {
    id: 2,
    title: 'Cybersecurity Championship 2025',
    text: 'HITU students secured first place in the National Cybersecurity Championship 2025, competing against teams from top universities across Egypt. The team demonstrated exceptional skills in penetration testing and digital forensics.',
    image: '/Pics/CS.png',
  },
  {
    id: 3,
    title: 'Industry Partnership with Leading Tech Companies',
    text: 'HITU has signed strategic partnership agreements with several leading technology companies to provide internship opportunities and co-op programs for students, bridging the gap between academic learning and real-world industry experience.',
    image: '/Pics/Data Science.jpg',
  },
  {
    id: 4,
    title: 'International Accreditation Achieved',
    text: 'HITU has successfully obtained international accreditation for its engineering and technology programs, reinforcing its commitment to delivering globally recognized, high-quality technical education aligned with international standards.',
    image: '/Pics/bulding A.jpg',
  },
  {
    id: 5,
    title: 'New Mechatronics Workshop Opens',
    text: 'A cutting-edge Mechatronics and Robotics Workshop has opened at HITU, featuring industrial robotic arms, CNC machines, and automated assembly lines. Students can now gain hands-on experience with the same equipment used in top manufacturing facilities worldwide.',
    image: '/Pics/mechatronics.png',
  },
]

function NewsSection() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef(null)

  const goTo = (index) => {
    if (index === current) return
    setFading(true)
    setTimeout(() => {
      setCurrent(index)
      setFading(false)
    }, 400)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % newsItems.length)
        setFading(false)
      }, 400)
    }, 4000)
    return () => clearInterval(timerRef.current)
  }, [])

  const news = newsItems[current]

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#051c26] to-[#082531]">
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <h2 className="text-4xl md:text-5xl font-bold text-[#c19a6b] mb-14 text-center">
            Latest News
          </h2>
        </FadeUp>

        {/* News card */}
        <div
          style={{
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateX(-32px)' : 'translateX(0)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
          className="grid md:grid-cols-2 gap-10 items-center bg-[#0a2e3f]/60 border border-[#c19a6b]/20 rounded-2xl p-8 shadow-2xl shadow-black/40"
        >
          {/* Left: text */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#c19a6b]/70">
              News {current + 1} / {newsItems.length}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-[#c19a6b] leading-snug">
              {news.title}
            </h3>
            <p className="text-lg leading-relaxed opacity-85">
              {news.text}
            </p>
          </div>

          {/* Right: image */}
          <div className="rounded-xl overflow-hidden border border-[#c19a6b]/20 shadow-xl shadow-black/40 aspect-video relative">
            <Image
              src={news.image}
              alt={news.title}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* News indicator tabs */}
        <div className="flex justify-center gap-2 mt-10 flex-wrap">
          {newsItems.map((item, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`News ${i + 1}`}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                background: i === current
                  ? 'linear-gradient(135deg, #c19a6b, #a07840)'
                  : 'rgba(193,154,107,0.08)',
                border: i === current ? '1.5px solid #c19a6b' : '1.5px solid rgba(193,154,107,0.25)',
                color: i === current ? '#082531' : 'rgba(193,154,107,0.6)',
                fontWeight: i === current ? 700 : 400,
                fontSize: '0.78rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: i === current ? '0 2px 12px rgba(193,154,107,0.3)' : 'none',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const glow = document.getElementById('cursor-glow')
      if (glow) {
        glow.style.left = `${e.clientX}px`
        glow.style.top = `${e.clientY}px`
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // إلغاء background الـ body في صفحة الهوم بس
  useEffect(() => {
    document.body.classList.add('no-body-bg')
    return () => {
      document.body.classList.remove('no-body-bg')
    }
  }, [])



  return (
    <main
      className="min-h-screen text-[#f8f6f0] relative overflow-x-hidden"
      style={{
        backgroundImage: "url('Front/public/Pics/BackGround.jpeg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Cursor glow effect */}
      <div
        id="cursor-glow"
        className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-r from-[#c19a6b]/10 via-[#d4b07c]/5 to-transparent blur-3xl z-50 transition duration-100 ease-out"
      />

      {/* Header / Navbar */}
      <Header title="Landing Page" />   {/* افترض إن الـ Header معمول فيه navbar شفاف أو داكن */}

      {/* Floating Login Button */}
      <button
        onClick={() => window.location.href = '/login'}
        style={{
          position: 'fixed',
          top: '50%',
          right: '0',
          transform: 'translateY(-50%)',
          background: 'linear-gradient(90deg, #caa13c, #e4bd63)',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderTopLeftRadius: '15px',
          borderBottomLeftRadius: '15px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '-4px 4px 15px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.3s ease, padding 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.paddingRight = '30px';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.paddingRight = '20px';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
          <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
        </svg>
        Login
      </button>

      {/* Hero Section –––––––––––––––––––––––––––––––––––––––– */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-24 pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#082531]/40 via-transparent to-[#082531]/80 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Right: device mockups */}
          <div className="relative hidden md:flex items-center justify-center h-[480px]">

            {/* Laptop frame */}
            <div className="absolute left-0 top-0 w-[88%]">
              {/* Screen */}
              <div className="rounded-xl overflow-hidden border-[3px] border-[#1e3a47] bg-[#0a2030] shadow-2xl shadow-black/60">
              
                {/* Website preview inside laptop */}
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image src="/Pics/bulding A.jpg" alt="HITU preview" fill className="object-cover opacity-80" />
                  {/* Overlay content mimicking the website */}
                 
                </div>
              </div>
            </div>
          </div>
          {/* Left: text */}
          <div className="space-y-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight">
              Welcome to <span className="text-[#c19a6b]">HITU</span>
            </h1>
            <p className="text-xl md:text-2xl font-light opacity-90">
              Excellence in Technical Education
            </p>
            <p className="text-lg opacity-75">
              Helwan International Technological University offers applied, future-ready education with hands-on training, cutting-edge labs, and strong industry partnerships.
            </p>
          </div>

        </div>
      </section>

      {/* Introduction / About Section –––––––––––––––––––––––– */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#082531] to-[#051c26]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#c19a6b] mb-10 text-center">
            Helwan International Technical University
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-lg leading-relaxed opacity-90">
              <p>
                Helwan International Technological University is a modern public technological university in Egypt, delivering applied education that blends strong theoretical foundations with intensive practical training in advanced laboratories and workshops.
              </p>
              <p>
                Our mission is to graduate highly skilled technicians and applied engineers who can meet the demands of rapidly evolving local, regional, and international industries.
              </p>
              <p>
                We emphasize hands-on learning, mandatory industry internships, modern curricula aligned with global technological trends, and strong employability focus.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-[#c19a6b]/20 aspect-video relative">
              <Image 
                src="/Pics/bulding A.jpg" 
                alt="University Campus / Lab Photo" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section ––––––––––––––––––––––––––––––––––– */}
      <NewsSection />

      {/* Programs / Departments Section */}
      <section id="programs" className="py-32 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#051c26] to-[#082531]">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <h2 className="text-4xl md:text-5xl font-bold text-[#c19a6b] mb-20 text-center">
              Our Programs &amp; Departments
            </h2>
          </FadeUp>

          <div className="space-y-60" style={{ direction: 'ltr' }}>
            {departments.map((dept, index) => (
              <FadeUp key={dept.id} delay={0}>
                {/* Two-column grid — alternates image side each row */}
                <div id={dept.name} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
                  {/* Text side */}
                  <div className={`space-y-6 text-lg leading-relaxed opacity-90 ${index % 2 === 1 ? 'md:[direction:ltr]' : ''}`}>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#c19a6b]">
                      {dept.id}. {dept.name}
                    </h3>
                    <p>{dept.overview}</p>
                  </div>

                  {/* Image side */}
                  <div className={`rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-[#c19a6b]/20 aspect-video relative ${index % 2 === 1 ? 'md:[direction:ltr]' : ''}`}>
                    <Image
                      src={dept.image}
                      alt={dept.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* لو عايز تضيف NewsCarousel هنا */}
      {/* <NewsCarousel /> */}

      <CircularMenu />

      {/* ===== Footer ===== */}
      <footer style={{ background: 'rgba(4,14,20,0.85)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(193,154,107,0.2)' }}>

        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Col 1 – Brand */}
          <div className="space-y-4" style={{ direction: 'ltr' }}>
            <div className="flex items-center gap-3">
              <Image src="Front/public/Pics/logo.png" alt="HITU Logo" width={44} height={44} className="rounded-full" />
              <span className="text-xl font-bold text-[#c19a6b] tracking-wide">HITU</span>
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              Helwan International Technological University — Applied education shaping tomorrow's engineers and technicians.
            </p>
            {/* Social icons */}
            <div className="flex gap-4 pt-2">
              {[
                { label: 'Facebook', href: '#', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { label: 'Instagram', href: '#', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z' },
                { label: 'YouTube', href: '#', path: 'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z' },
              ].map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ background: 'rgba(193,154,107,0.12)', border: '1px solid rgba(193,154,107,0.25)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="#c19a6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 – Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[#c19a6b] font-bold text-lg tracking-wide">Quick Links</h4>
            <ul className="space-y-3 text-sm opacity-75">
              {[
                { label: 'Home', href: '/' },
                { label: 'About HITU', href: '#' },
                { label: 'Programs & Departments', href: '#programs' },
                { label: 'Student Portal', href: '#' },
                { label: 'News & Events', href: '#' },
                { label: 'Contact Us', href: '#contact' },
              ].map(({ label, href }) => (
                <li key={label} style={{ direction: 'ltr' }}>
                  <a
                    href={href}
                    className="flex items-center gap-2 hover:text-[#c19a6b] transition-colors duration-200"
                  >
                    <span style={{ color: '#c19a6b', fontSize: '0.5rem' }}>◆</span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Departments */}
          <div className="space-y-4">
            <h4 className="text-[#c19a6b] font-bold text-lg tracking-wide">Departments</h4>
            <ul className="space-y-3 text-sm opacity-75" style={{ direction: 'ltr' }}>
              {departments.map((dep) => (
                <li key={dep.id}>
                  <a href={`#${dep.name}`} className="flex items-center gap-2 hover:text-[#c19a6b] transition-colors duration-200">
                    <span style={{ color: '#c19a6b', fontSize: '0.5rem' }}>◆</span>
                    {dep.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 – Contact */}
          <div id="contact" className="space-y-4">
            <h4 className="text-[#c19a6b] font-bold text-lg tracking-wide">Contact Us</h4>
            <ul className="space-y-4 text-sm opacity-75">
              {[
                { icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', text: 'Helwan, Cairo, Egypt' },
                { icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z', text: '+20 2 1234 5678' },
                { icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6', text: 'info@hitu.edu.eg' },
                { icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z', text: 'www.hitu.edu.eg' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3" style={{ direction: 'ltr' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="#c19a6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="mt-0.5 shrink-0">
                    <path d={icon} />
                  </svg>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(193,154,107,0.15)' }} className="max-w-6xl mx-auto" />

        {/* Copyright bar */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-50">
          <span>© {new Date().getFullYear()} Helwan International Technological University. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#c19a6b] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#c19a6b] transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-[#c19a6b] transition-colors">Sitemap</a>
          </div>
        </div>
      </footer>

    </main>
  )
}
