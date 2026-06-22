'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import '@/styles/CircularBottomNav.css';
import {
  HomeIcon, GraduationIcon, BooksIcon, DocumentIcon,
  QuestionIcon, NewspaperIcon, LocationIcon, StethoscopeIcon, GamepadIcon,PlusIcon
} from '@/app/components/Icons';

const CircularMenu = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const getDocumentsHref = () => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      if (role === 'student affairs') return '/documents/admin';
      if (role === 'student') return '/documents/request';
    }
    return '/documents';
  };

  const menuItems = [
    { name: 'Home',      icon: <HomeIcon size={35} />,          href: '/',           orbit: 'inner' },
    { name: 'Student',   icon: <GraduationIcon size={35} />,    href: '/student-page', orbit: 'inner' },
    { name: 'Library',   icon: <BooksIcon size={35} />,         href: '/library',    orbit: 'inner' },
    { name: 'Documents', icon: <DocumentIcon size={35} />,      href: getDocumentsHref(),  orbit: 'outer' },
    { name: 'FAQ',       icon: <QuestionIcon size={35} />,      href: '/faq',        orbit: 'outer' },
    { name: 'News',      icon: <NewspaperIcon size={35} />,     href: '/news',       orbit: 'outer' },
    { name: 'GPS',       icon: <LocationIcon size={35} />,      href: '/gps',        orbit: 'outer' },
    { name: 'Doctor',    icon: <StethoscopeIcon size={35} />,   href: '/doctor',     orbit: 'outer' },
    { name: 'Control',   icon: <GamepadIcon size={35} />,       href: '/control',    orbit: 'outer' },
  ];

  // تقسيم الأيقونات نصين (يسار ويمين)
  const leftItems = menuItems.slice(0, Math.ceil(menuItems.length / 2));
  const rightItems = menuItems.slice(Math.ceil(menuItems.length / 2));

  // حساب موضع على مدارات منتظمة (مثل المدارات الذرية)
  const getPosition = (item, indexInGroup) => {
    const innerItems = menuItems.filter(i => i.orbit === 'inner');
    const outerItems = menuItems.filter(i => i.orbit === 'outer');
    
    const totalInOrbit = item.orbit === 'inner' ? innerItems.length : outerItems.length;
    const radius = item.orbit === 'inner' ? 70 : 140; // مدار داخلي وخارجي
    
    const angle = (indexInGroup / (totalInOrbit - 1 || 1)) * Math.PI;
    
    const x = Math.cos(angle) * radius;
    const y = -Math.sin(angle) * radius;
    
    return { x, y };
  };

  const isMenuActive = isOpen;

  return (
    <div 
      className={`menu-container ${isOpen ? 'open' : ''}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => {
        setIsOpen(false);
        setActiveItem(null);
      }}
    >
      {/* الزر الرئيسي */}
      <span 
        className={`central-circle ${activeItem === 'home' || !activeItem ? 'active' : ''}`}
        onMouseEnter={() => setActiveItem('home')}
        onClick={() => setIsOpen(!isOpen)}
        style={{ textDecoration: 'none' }}
      >
        <span><PlusIcon size={40} color="#fff" /></span>
      </span>

      {/* الأيقونات على مدارات منتظمة */}
      {menuItems.map((item, globalIndex) => {
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
              transition: `all 0.3s ease ${globalIndex * 0.05}s`,
              opacity: isMenuActive ? 1 : 0,
              pointerEvents: isMenuActive ? 'auto' : 'none',
              backgroundColor: activeItem === item.name ? '#7c4dff' : '#304ffe',
            }}
          >
            <span>{item.icon}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default CircularMenu;