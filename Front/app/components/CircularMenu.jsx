'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/styles/CircularBottomNav.css';
import {
  HomeIcon, GraduationIcon, BooksIcon, DocumentIcon,
  QuestionIcon, NewspaperIcon, LocationIcon, StethoscopeIcon, GamepadIcon
} from '@/app/components/Icons';

const CircularMenu = ({ loading = false }) => {
  const [activeItem, setActiveItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole'));
    }
  }, []);

  const spinStyle = loading ? {
    animation: 'spin-logo 2s linear infinite',
  } : {};

  const spinKeyframes = `
    @keyframes spin-logo {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  const getDocumentsHref = () => {
    if (role === 'student affairs') return '/documents/admin';
    if (role === 'student') return '/documents/request';
    return '/documents';
  };

  const allItems = [
    { name: 'Home',      icon: <HomeIcon size={35} />,          href: '/',               orbit: 'inner' },
    { name: 'Student',   icon: <GraduationIcon size={35} />,    href: '/student-page',   role: 'student', orbit: 'inner' },
    { name: 'Library',   icon: <BooksIcon size={35} />,         href: '/library',        orbit: 'inner' },
    { name: 'Documents', icon: <DocumentIcon size={35} />,      href: getDocumentsHref(), orbit: 'outer' },
    { name: 'FAQ',       icon: <QuestionIcon size={35} />,      href: '/faq',            orbit: 'outer' },
    { name: 'News',      icon: <NewspaperIcon size={35} />,     href: '/news',           orbit: 'outer' },
    { name: 'GPS',       icon: <LocationIcon size={35} />,      href: '/gps',            orbit: 'outer' },
    { name: 'Doctor',    icon: <StethoscopeIcon size={35} />,   href: '/doctor',         role: 'doctor', orbit: 'outer' },
    { name: 'Control',   icon: <GamepadIcon size={35} />,       href: '/control',        role: 'control', orbit: 'outer' },
  ];

  const menuItems = allItems.filter((item) => {
    if (!item.role) return true;
    if (!role) return false;
    return item.role === role;
  });

  const getPosition = (item, indexInGroup) => {
    const orbitItems = menuItems.filter(i => i.orbit === item.orbit);
    const totalInOrbit = orbitItems.length;
    const radius = item.orbit === 'inner' ? 70 : 140;

    const angle = (indexInGroup / (totalInOrbit - 1 || 1)) * Math.PI;

    const x = Math.cos(angle) * radius;
    const y = -Math.sin(angle) * radius;

    return { x, y };
  };

  const isMenuActive = isOpen;

  return (
    <>
      <div className={`loading-overlay ${loading ? 'visible' : ''}`} />

      <div
        className={`menu-container ${isOpen ? 'open' : ''} ${loading ? 'is-loading' : ''}`}
        onMouseEnter={() => !loading && setIsOpen(true)}
        onMouseLeave={() => {
          setIsOpen(false);
          setActiveItem(null);
        }}
      >
        <style>{spinKeyframes}</style>
        <span
          className={`central-circle ${activeItem === 'home' || !activeItem ? 'active' : ''}`}
          onMouseEnter={() => !loading && setActiveItem('home')}
          onClick={() => !loading && setIsOpen(!isOpen)}
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'white',
            padding: '8px',
            cursor: loading ? 'wait' : 'pointer',
            ...spinStyle
          }}
        >
          <img
            src="/Pics/logoHITU.png"
            alt="HITU Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: !loading && activeItem === 'home' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
          />
        </span>

        {!loading && menuItems.map((item, globalIndex) => {
          const orbitItems = menuItems.filter(i => i.orbit === item.orbit);
          const indexInOrbit = orbitItems.indexOf(item);
          const { x, y } = getPosition(item, indexInOrbit);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="circle"
              onMouseEnter={() => setActiveItem(item.name)}
              title={item.name}
              style={{
                textDecoration: 'none',
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`,
                transition: `all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${globalIndex * 0.05}s`,
                opacity: isMenuActive ? 1 : 0,
                pointerEvents: isMenuActive ? 'auto' : 'none',
                backgroundColor: activeItem === item.name ? '#d29505' : '#1a1a2e',
                border: '2px solid rgba(255,255,255,0.1)'
              }}
            >
              <span style={{ color: activeItem === item.name ? '#000' : '#fff' }}>{item.icon}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default CircularMenu;
