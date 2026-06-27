'use client'

import { useState, useMemo, useEffect } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import { api } from '@/lib/api'

// ── Campus Data ────────────────────────────────────────────────────────────────
const BUILDINGS = [
  {
    id: 'A',
    name: 'Building A',
    color: '#c9860a',
    rooms: [
      { id: 'A01',  label: 'A01 – Lecture Hall',      type: 'lecture' },
      { id: 'A02',  label: 'A02 – Lecture Hall',      type: 'lecture' },
      { id: 'A202', label: 'A202 – Classroom',        type: 'class'   },
      { id: 'A203', label: 'A203 – Classroom',        type: 'class'   },
      { id: 'A302', label: 'A302 – Lab',              type: 'lab'     },
      { id: 'A303', label: 'A303 – Lab',              type: 'lab'     },
      { id: 'A304', label: 'A304 – Lab',              type: 'lab'     },
      { id: 'A305', label: 'A305 – Seminar Room',     type: 'seminar' },
      { id: 'A306', label: 'A306 – Seminar Room',     type: 'seminar' },
      { id: 'A307', label: 'A307 – Office',           type: 'office'  },
    ],
  },
  {
    id: 'C',
    name: 'Building C',
    color: '#4fc3f7',
    rooms: [
      { id: 'C01',  label: 'C01 – Lecture Hall',      type: 'lecture' },
      { id: 'C101', label: 'C101 – Classroom',        type: 'class'   },
      { id: 'C102', label: 'C102 – Classroom',        type: 'class'   },
      { id: 'C201', label: 'C201 – Lab',              type: 'lab'     },
      { id: 'C202', label: 'C202 – Lab',              type: 'lab'     },
    ],
  },
  {
    id: 'D',
    name: 'Building D',
    color: '#81c784',
    rooms: [
      { id: 'D01',  label: 'D01 – Auditorium',        type: 'lecture' },
      { id: 'D101', label: 'D101 – Classroom',        type: 'class'   },
      { id: 'D102', label: 'D102 – Classroom',        type: 'class'   },
      { id: 'D201', label: 'D201 – Computer Lab',     type: 'lab'     },
    ],
  },
  {
    id: 'F',
    name: 'Building F',
    color: '#ce93d8',
    rooms: [
      { id: 'F01',  label: 'F01 – Library',           type: 'library' },
      { id: 'F101', label: 'F101 – Study Room',       type: 'seminar' },
      { id: 'F102', label: 'F102 – Study Room',       type: 'seminar' },
      { id: 'F201', label: 'F201 – Admin Office',     type: 'office'  },
    ],
  },
  {
    id: 'G',
    name: 'Building G',
    color: '#ff8a65',
    rooms: [
      { id: 'G01',  label: 'G01 – Cafeteria',         type: 'other'   },
      { id: 'G101', label: 'G101 – Student Services', type: 'office'  },
      { id: 'G201', label: 'G201 – Sports Hall',      type: 'other'   },
    ],
  },
]

const TYPE_ICONS = {
  lecture: '🎓',
  class:   '🏫',
  lab:     '🔬',
  seminar: '💬',
  office:  '🏢',
  library: '📚',
  other:   '📍',
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function GPSPage() {
  const [buildings, setBuildings] = useState(BUILDINGS)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedRoom, setSelectedRoom]         = useState(null)
  const [searchQuery, setSearchQuery]           = useState('')
  const [sidebarTab, setSidebarTab]             = useState('buildings') // 'buildings' | 'search'

  useEffect(() => {
    async function loadBuildings() {
      try {
        const res = await api.buildings.getAll()
        if (res.status === 'success' && res.data) {
          const grouped = res.data.reduce((acc, curr) => {
            const loc = curr.building_loc
            if (!acc[loc]) {
              const colorMap = { 'A': '#c9860a', 'C': '#4fc3f7', 'D': '#81c784', 'F': '#ce93d8', 'G': '#ff8a65' }
              acc[loc] = {
                id: loc,
                name: `Building ${loc}`,
                color: colorMap[loc] || '#aaa',
                rooms: []
              }
            }
            acc[loc].rooms.push({
              id: curr.room_num,
              label: `${curr.room_num} - ${curr.room_name || 'Room'}`,
              type: curr.room_name?.toLowerCase().includes('lab') ? 'lab' 
                    : (curr.room_name?.toLowerCase().includes('office') || curr.room_name?.includes('مكتب')) ? 'office' 
                    : (curr.room_name?.includes('مدرج') || curr.room_name?.toLowerCase().includes('hall')) ? 'lecture'
                    : 'class'
            })
            return acc
          }, {})
          setBuildings(Object.values(grouped).sort((a,b) => a.id.localeCompare(b.id)))
        }
      } catch (error) {
        console.error('Error loading buildings:', error)
      }
    }
    loadBuildings()
  }, [])

  // Flatten all rooms for search
  const allRooms = useMemo(() =>
    buildings.flatMap(b => b.rooms.map(r => ({ ...r, buildingId: b.id, buildingName: b.name, buildingColor: b.color }))),
    [buildings]
  )

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return allRooms.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.label.toLowerCase().includes(q) ||
      r.buildingName.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    )
  }, [searchQuery, allRooms])

  const currentBuilding = buildings.find(b => b.id === selectedBuilding)
  const activeColor = currentBuilding?.color || '#c9860a'

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    // In a real implementation this would fly the 3D camera to the room
  }

  return (
    <>
      <Header title="Campus Map & GPS" />

      <div style={{
        minHeight: '100vh',
        padding: '90px 0 100px',
        fontFamily: "'Outfit', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>

        {/* ── Page Title row ── */}
        <div style={{ padding: '0 24px 20px' }}>
          <h1 style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            background: 'linear-gradient(135deg,#c9860a,#e6a820)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: 1,
          }}>
            🗺️ Campus Navigator
          </h1>
          <p style={{ color: '#999', margin: '6px 0 0', fontSize: 14 }}>
            Navigate buildings, classrooms, labs, and facilities across the entire campus
          </p>
        </div>

        {/* ── Main Layout: Sidebar + Map ── */}
        <div className="gps-layout" style={{
          display: 'flex',
          gap: 0,
          flex: 1,
          padding: '0 24px',
          minHeight: 0,
          direction: 'ltr',
        }}>

          {/* ════════════════════════════════════════
              SIDEBAR
          ════════════════════════════════════════ */}
          <aside style={{
            width: 280,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRight: 'none',
            borderRadius: '18px 0 0 18px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>

            {/* Sidebar Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { key: 'buildings', label: '🏛️ Buildings' },
                { key: 'search',    label: '🔍 Search' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setSidebarTab(tab.key)} style={{
                  flex: 1,
                  padding: '14px 8px',
                  background: sidebarTab === tab.key ? 'rgba(201,134,10,0.15)' : 'transparent',
                  border: 'none',
                  borderBottom: sidebarTab === tab.key ? '2px solid #c9860a' : '2px solid transparent',
                  color: sidebarTab === tab.key ? '#e6a820' : '#888',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  letterSpacing: 0.5,
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Buildings Tab ── */}
            {sidebarTab === 'buildings' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {buildings.map(building => (
                  <div key={building.id}>
                    {/* Building Header */}
                    <button
                      onClick={() => {
                        setSelectedBuilding(selectedBuilding === building.id ? null : building.id)
                        setSelectedRoom(null)
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 18px',
                        background: selectedBuilding === building.id
                          ? `rgba(${hexToRgb(building.color)}, 0.12)`
                          : 'transparent',
                        border: 'none',
                        borderLeft: selectedBuilding === building.id
                          ? `3px solid ${building.color}`
                          : '3px solid transparent',
                        color: selectedBuilding === building.id ? building.color : '#ddd',
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span style={{
                        width: 32, height: 32,
                        borderRadius: '50%',
                        background: `rgba(${hexToRgb(building.color)}, 0.2)`,
                        border: `1px solid ${building.color}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: building.color, flexShrink: 0,
                      }}>
                        {building.id}
                      </span>
                      <span style={{ flex: 1 }}>{building.name}</span>
                      <span style={{
                        fontSize: 18, transition: 'transform 0.3s',
                        transform: selectedBuilding === building.id ? 'rotate(90deg)' : 'rotate(0deg)',
                        color: '#555',
                      }}>›</span>
                    </button>

                    {/* Rooms List */}
                    {selectedBuilding === building.id && (
                      <div style={{ background: 'rgba(0,0,0,0.15)', paddingBottom: 4 }}>
                        {building.rooms.map(room => (
                          <button
                            key={room.id}
                            onClick={() => handleRoomSelect({ ...room, buildingId: building.id, buildingName: building.name, buildingColor: building.color })}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '9px 18px 9px 52px',
                              background: selectedRoom?.id === room.id
                                ? `rgba(${hexToRgb(building.color)}, 0.15)`
                                : 'transparent',
                              border: 'none',
                              borderLeft: selectedRoom?.id === room.id
                                ? `3px solid ${building.color}`
                                : '3px solid transparent',
                              color: selectedRoom?.id === room.id ? building.color : '#bbb',
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: 13,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <span style={{ fontSize: 14 }}>{TYPE_ICONS[room.type]}</span>
                            <span>{room.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Search Tab ── */}
            {sidebarTab === 'search' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {/* Search Input */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  borderRadius: 10,
                  border: '1px solid rgba(201,134,10,0.4)',
                  background: 'rgba(255,255,255,0.06)',
                  boxSizing: 'border-box',
                }}>
                  <span style={{ fontSize: 16, pointerEvents: 'none', width: 24, textAlign: 'left' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search rooms, labs, offices..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13,
                      outline: 'none',
                      padding: '0px 0px',
                      margin: '0px 0px',
                    }}
                  />
                  <div style={{ width: 24, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} style={{
                        background: 'none', border: 'none',
                        color: '#888', cursor: 'pointer', fontSize: 16, padding: 0,
                      }}>×</button>
                    )}
                  </div>
                </div>

                {/* Search hint */}
                {!searchQuery && (
                  <p style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
                    Type a room number, building name, or room type (e.g. "lab", "A302")
                  </p>
                )}

                {/* Search Results */}
                {searchQuery && searchResults.length === 0 && (
                  <p style={{ color: '#666', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                    No locations found for "{searchQuery}"
                  </p>
                )}

                {searchResults.map(room => (
                  <button
                    key={`${room.buildingId}-${room.id}`}
                    onClick={() => {
                      setSelectedBuilding(room.buildingId)
                      handleRoomSelect(room)
                      setSidebarTab('buildings')
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '11px 14px',
                      marginBottom: 8,
                      background: selectedRoom?.id === room.id
                        ? `rgba(${hexToRgb(room.buildingColor)}, 0.15)`
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedRoom?.id === room.id ? room.buildingColor : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      color: '#ddd',
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedRoom?.id === room.id ? `rgba(${hexToRgb(room.buildingColor)}, 0.15)` : 'rgba(255,255,255,0.04)'}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `rgba(${hexToRgb(room.buildingColor)}, 0.2)`,
                      border: `1px solid ${room.buildingColor}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: room.buildingColor, flexShrink: 0,
                    }}>
                      {room.buildingId}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: 2 }}>{room.id}</div>
                      <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {TYPE_ICONS[room.type]} {room.label} · {room.buildingName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

          </aside>

          {/* ════════════════════════════════════════
              3D MAP AREA
          ════════════════════════════════════════ */}
          <div className="map-area" style={{
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0 18px 18px 0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 520,
          }}>

            {/* Map Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexWrap: 'wrap',
            }}>
              <span style={{ color: '#c9860a', fontSize: 13, fontWeight: 700 }}>
                📍 {selectedRoom
                  ? `${selectedRoom.buildingName} › ${selectedRoom.label}`
                  : selectedBuilding
                    ? `Building ${selectedBuilding} – Select a room`
                    : 'HITU Campus – 3D Overview'
                }
              </span>
              <div style={{ flex: 1 }} />

              {/* Quick filter chips */}
              {['lecture', 'lab', 'office', 'library'].map(type => (
                <span key={type} style={{
                  padding: '5px 12px',
                  borderRadius: 50,
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#aaa',
                  cursor: 'pointer',
                  letterSpacing: 0.5,
                  transition: 'all 0.2s',
                  userSelect: 'none',
                }}>
                  {TYPE_ICONS[type]} {type.charAt(0).toUpperCase() + type.slice(1)}s
                </span>
              ))}
            </div>

            {/* ── 3D MAP PLACEHOLDER ── */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 20,
              position: 'relative',
              overflow: 'hidden',
              minHeight: 440,
            }}>

              {/* Animated grid background */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(201,134,10,0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(201,134,10,0.06) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                animation: 'gridPulse 4s ease-in-out infinite',
              }} />

              {/* Decorative corner glows */}
              <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(${hexToRgb(activeColor)}, 0.15) 0%, transparent 70%)`, transition: 'background 0.5s ease' }} />
              <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,148,255,0.08) 0%, transparent 70%)' }} />

              {/* Room info card (shown when a room is selected) */}
              {selectedRoom && (
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${selectedRoom.buildingColor}44`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  maxWidth: 220,
                  zIndex: 10,
                  animation: 'fadeIn 0.3s ease',
                }}>
                  <div style={{ color: selectedRoom.buildingColor, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                    {TYPE_ICONS[selectedRoom.type]} {selectedRoom.id}
                  </div>
                  <div style={{ color: '#ccc', fontSize: 12, marginBottom: 4 }}>{selectedRoom.label}</div>
                  <div style={{ color: '#888', fontSize: 11 }}>{selectedRoom.buildingName}</div>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    style={{
                      position: 'absolute', top: 8, right: 10,
                      background: 'none', border: 'none',
                      color: '#555', cursor: 'pointer', fontSize: 18, lineHeight: 1,
                    }}
                  >×</button>
                </div>
              )}

              {/* Center placeholder content */}
              <div style={{
                textAlign: 'center',
                zIndex: 1,
                animation: 'floatUp 3s ease-in-out infinite',
              }}>
                <div style={{ fontSize: 72, marginBottom: 12, filter: 'drop-shadow(0 0 30px rgba(201,134,10,0.4))' }}>
                  🏛️
                </div>
                <h2 style={{
                  margin: '0 0 8px',
                  fontSize: 22,
                  fontWeight: 800,
                  background: 'linear-gradient(135deg,#c9860a,#e6a820)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  3D Campus Map
                </h2>
                <p style={{ color: '#777', fontSize: 14, margin: '0 0 6px', maxWidth: 360 }}>
                  Interactive 3D map of the entire HITU campus — buildings, halls, labs & rooms
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 18px',
                  borderRadius: 50,
                  border: '1px solid rgba(201,134,10,0.35)',
                  color: '#c9860a',
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(201,134,10,0.08)',
                  marginTop: 4,
                }}>
                  🚧 3D Engine Integration Coming Soon
                </span>
              </div>

              {/* Building dots overlay */}
              {BUILDINGS.map((b, i) => {
                const positions = [
                  { left: '20%', top: '35%' },
                  { left: '38%', top: '55%' },
                  { left: '55%', top: '30%' },
                  { left: '70%', top: '50%' },
                  { left: '60%', top: '65%' },
                ]
                const pos = positions[i] || { left: `${(i * 15) % 80 + 10}%`, top: `${(i * 20) % 80 + 10}%` }
                const isActive = selectedBuilding === b.id
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBuilding(b.id)
                      setSelectedRoom(null)
                      setSidebarTab('buildings')
                    }}
                    title={b.name}
                    style={{
                      position: 'absolute',
                      left: pos.left,
                      top: pos.top,
                      width: isActive ? 52 : 42,
                      height: isActive ? 52 : 42,
                      borderRadius: '50%',
                      background: isActive
                        ? b.color
                        : `rgba(${hexToRgb(b.color)}, 0.2)`,
                      border: `2px solid ${isActive ? b.color : b.color + '66'}`,
                      color: isActive ? '#111' : b.color,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? `0 0 24px ${b.color}88` : `0 0 10px ${b.color}33`,
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: isActive ? 'none' : `pulse${b.id} 2.5s ease-in-out infinite`,
                    }}
                  >
                    {b.id}
                  </button>
                )
              })}

            </div>

            {/* Map Legend */}
            <div style={{
              display: 'flex',
              gap: 16,
              padding: '12px 18px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              <span style={{ color: '#666', fontSize: 12, fontWeight: 600, marginRight: 4 }}>LEGEND:</span>
              {Object.entries(TYPE_ICONS).map(([type, icon]) => (
                <span key={type} style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{icon}</span>
                  <span style={{ textTransform: 'capitalize' }}>{type}</span>
                </span>
              ))}
            </div>
          </div>

        </div>{/* end main layout */}

      </div>

      <CircularMenu />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

        @keyframes gridPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Sidebar scroll */
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: rgba(201,134,10,0.3); border-radius: 4px; }

        /* Map area scrollbar */
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        @media (max-width: 768px) {
          aside { width: 100% !important; border-radius: 18px 18px 0 0 !important; border-right: 1px solid rgba(255,255,255,0.1) !important; border-bottom: none !important; }
          .gps-layout { flex-direction: column !important; }
          .map-area { border-radius: 0 0 18px 18px !important; }
        }

        input::placeholder { color: #555; }
        button:focus-visible { outline: 2px solid #c9860a; outline-offset: 2px; }

        /* Building pulse animations */
        @keyframes pulseA { 0%,100%{box-shadow:0 0 10px #c9860a33} 50%{box-shadow:0 0 22px #c9860a66} }
        @keyframes pulseC { 0%,100%{box-shadow:0 0 10px #4fc3f733} 50%{box-shadow:0 0 22px #4fc3f766} }
        @keyframes pulseD { 0%,100%{box-shadow:0 0 10px #81c78433} 50%{box-shadow:0 0 22px #81c78466} }
        @keyframes pulseF { 0%,100%{box-shadow:0 0 10px #ce93d833} 50%{box-shadow:0 0 22px #ce93d866} }
        @keyframes pulseG { 0%,100%{box-shadow:0 0 10px #ff8a6533} 50%{box-shadow:0 0 22px #ff8a6566} }
      `}</style>
    </>
  )
}

// ── Utility ───────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
