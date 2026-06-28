'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SendIcon, PaperclipIcon, FileTextIcon, ArrowLeftIcon, VideoIcon } from '@/app/components/Icons'

export default function LiveLecturePage() {
  const params = useParams()
  const router = useRouter()
  const lectureId = params.id
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System', text: 'Welcome to the live lecture! Waiting for you to start the stream.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isInstructor: true },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [peer, setPeer] = useState(null)
  const [connections, setConnections] = useState([])
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  
  const videoRef = useRef(null)
  const connectionsRef = useRef([])

  // Load PeerJS from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
    script.async = true;
    script.onload = () => {
      console.log("PeerJS loaded");
    };
    document.body.appendChild(script);
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
      const existingScript = document.querySelector('script[src*="peerjs"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    }
  }, [localStream, peer]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize Peer
      const newPeer = new window.Peer(`evo-lecture-${lectureId}`);
      
      newPeer.on('open', (id) => {
        console.log('Peer ID:', id);
        setIsLive(true);
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          sender: 'System', 
          text: 'You are now LIVE! Students can now join.', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          isInstructor: true 
        }]);
      });

      newPeer.on('call', (call) => {
        console.log('Incoming CALL from student:', call.peer);
        if (stream) {
          console.log('Answering call with local stream');
          call.answer(stream); 
        } else {
          console.error('Incoming call but no local stream available!');
        }
      });

      newPeer.on('connection', (conn) => {
        console.log('New DATA connection from student:', conn.peer);
        
        conn.on('open', () => {
          console.log('Data connection opened with student:', conn.peer);
          connectionsRef.current.push(conn);
          setConnections([...connectionsRef.current]);
          
          conn.on('data', (data) => {
            if (data.type === 'chat') {
              const incomingMsg = {
                id: Date.now(),
                sender: data.sender || 'Student',
                text: data.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isInstructor: false
              };
              setMessages(prev => [...prev, incomingMsg]);
              
              // Broadcast to everyone else
              connectionsRef.current.forEach(c => {
                if (c !== conn) {
                  c.send({ type: 'chat', ...incomingMsg });
                }
              });
            } else if (data.type === 'request-stream') {
              console.log('Student requested stream:', data.peerId);
              if (stream && newPeer) {
                console.log('Calling student to send stream...');
                newPeer.call(data.peerId, stream);
              } else {
                console.warn('Stream request received but local stream is not ready.');
              }
            }
          });
        });

        conn.on('close', () => {
          connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
          setConnections([...connectionsRef.current]);
        });
      });

      setPeer(newPeer);
    } catch (err) {
      console.error('Error starting stream:', err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  }

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      sender: 'Dr. Sherif Ibrahim (You)',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInstructor: true
    }

    setMessages(prev => [...prev, message])
    
    // Broadcast message to all connected students
    connectionsRef.current.forEach(conn => {
      conn.send({
        type: 'chat',
        ...message
      });
    });

    setNewMessage('')
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#1a1a2e', minHeight: '100vh', color: '#fff' }}>
      
      {/* Header section */}
      <div className="d-flex align-items-center mb-4" style={{ gap: '15px' }}>
        <button 
          onClick={() => router.back()} 
          style={{
            background: 'none',
            border: 'none',
            color: '#6fc3ff',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.2rem',
            padding: '5px'
          }}
        >
          <ArrowLeftIcon size={24} style={{ marginRight: '8px' }} />
          Back
        </button>
        <h2 style={{color: '#6fc3ff', fontWeight: 'bold', margin: '0'}}>
          Live Lecture Control Panel
        </h2>
        
        {isLive && (
          <div style={{
            backgroundColor: '#ff6b6b',
            color: 'white',
            padding: '5px 15px',
            borderRadius: '20px',
            fontWeight: 'bold',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
            LIVE
          </div>
        )}
      </div>

      <div className="row g-4 h-100">
        
        {/* Left Column: Video and Resources (8 cols) */}
        <div className="col-lg-8" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Video Player Area */}
          <div style={{
            backgroundColor: '#000',
            border: '1px solid #6fc3ff',
            borderRadius: '12px',
            overflow: 'hidden',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: isLive ? 'block' : 'none' }}
            />
            
            {!isLive && (
              <div style={{ textAlign: 'center', color: '#6fc3ff' }}>
                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🎥</div>
                <h4>Ready to Start?</h4>
                <button 
                  onClick={startStream}
                  style={{
                    backgroundColor: '#6fc3ff',
                    color: '#1a1a2e',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    marginTop: '20px',
                    cursor: 'pointer'
                  }}
                >
                  Start Broadcasting
                </button>
              </div>
            )}
            
            {/* Custom Controls Overlays */}
            {isLive && (
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                padding: '15px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button 
                    onClick={toggleMute}
                    style={{ background: 'none', border: 'none', color: isMuted ? '#ff6b6b' : '#fff', cursor: 'pointer', fontSize: '1.5rem' }}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                  <button 
                    onClick={toggleCamera}
                    style={{ background: 'none', border: 'none', color: isCameraOff ? '#ff6b6b' : '#fff', cursor: 'pointer', fontSize: '1.5rem' }}
                  >
                    {isCameraOff ? '❌📷' : '📷'}
                  </button>
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>{connections.length} Students Watching</span>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  style={{
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    padding: '5px 15px',
                    borderRadius: '5px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  End Stream
                </button>
              </div>
            )}
          </div>

          {/* Instructor & Lecture Details */}
          <div style={{
            backgroundColor: '#162447',
            border: '1px solid #6fc3ff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}>
            <div className="d-flex align-items-center mb-3" style={{ gap: '15px' }}>
              <img src="/Pics/logo.png" width="60" style={{ borderRadius: '50%', border: '2px solid #6fc3ff' }} alt="Instructor" />
              <div>
                <h4 style={{ margin: '0', color: '#c19a6b' }}>Dr. Sherif Ibrahim</h4>
                <span style={{ color: '#a0aec0' }}>Control Panel (Instructor View)</span>
              </div>
            </div>
            <p style={{ color: '#e2e8f0', lineHeight: '1.6', marginBottom: '0' }}>
              Broadcasting from: <strong>evo-lecture-{lectureId}</strong>. All students joining this lecture ID will see your stream and can participate in the chat.
            </p>
          </div>

        </div>

        {/* Right Column: Chat (4 cols) */}
        <div className="col-lg-4">
          <div style={{
            backgroundColor: '#162447',
            border: '1px solid #6fc3ff',
            borderRadius: '12px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '15px 20px',
              borderBottom: '1px solid #6fc3ff',
              backgroundColor: 'rgba(26, 26, 46, 0.5)',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <h5 style={{ margin: '0', color: '#6fc3ff' }}>Live Discussion</h5>
              <small style={{ color: '#a0aec0' }}>{connections.length} active connections</small>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: '1',
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              minHeight: '400px',
              maxHeight: '600px'
            }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender.includes('You') ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingLeft: '4px', paddingRight: '4px' }}>
                    <small style={{ 
                      color: msg.isInstructor ? '#c19a6b' : '#6fc3ff', 
                      fontWeight: msg.isInstructor ? 'bold' : 'normal' 
                    }}>
                      {msg.sender} {msg.isInstructor && '🎓'}
                    </small>
                    <small style={{ color: '#64748b', fontSize: '0.7rem' }}>{msg.time}</small>
                  </div>
                  <div style={{
                    backgroundColor: msg.sender.includes('You') ? '#2a4365' : (msg.isInstructor ? 'rgba(213, 157, 1, 0.2)' : '#1a1a2e'),
                    border: `1px solid ${msg.sender.includes('You') ? '#4299e1' : (msg.isInstructor ? '#c19a6b' : '#2d3748')}`,
                    padding: '10px 15px',
                    borderRadius: '12px',
                    borderBottomRightRadius: msg.sender.includes('You') ? '4px' : '12px',
                    borderBottomLeftRadius: !msg.sender.includes('You') ? '4px' : '12px',
                    color: '#fff',
                    wordBreak: 'break-word'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div style={{
              padding: '15px',
              borderTop: '1px solid #6fc3ff',
              backgroundColor: 'rgba(26, 26, 46, 0.5)',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px'
            }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1', position: 'relative' }}>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isLive ? "Type a message..." : "Start stream to chat..."}
                    disabled={!isLive}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #4a5568',
                      borderRadius: '8px',
                      padding: '12px 15px',
                      paddingRight: '40px',
                      color: '#fff',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6fc3ff'}
                    onBlur={(e) => e.target.style.borderColor = '#4a5568'}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || !isLive}
                  style={{
                    backgroundColor: (newMessage.trim() && isLive) ? '#c19a6b' : '#4a5568',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (newMessage.trim() && isLive) ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <SendIcon size={18} />
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
        }
      `}</style>
    </div>
  )
}
