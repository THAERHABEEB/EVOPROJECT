'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SendIcon, PaperclipIcon, FileTextIcon, ArrowLeftIcon } from '@/app/components/Icons'

export default function LiveLecturePage() {
  const params = useParams()
  const router = useRouter()
  const lectureId = params.id
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System', text: 'Initializing connection...', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isInstructor: true },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [peer, setPeer] = useState(null)
  const [conn, setConn] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [studentName, setStudentName] = useState('Student')
  const [status, setStatus] = useState('Initializing...')
  
  const videoRef = useRef(null)
  const connRef = useRef(null)

  useEffect(() => {
    const savedName = localStorage.getItem('userName') || 'Student';
    setStudentName(savedName);

    const script = document.createElement('script');
    script.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
    script.async = true;
    script.onload = () => {
      initPeer();
    };
    document.body.appendChild(script);

    return () => {
      if (peer) peer.destroy();
    }
  }, []);

  const initPeer = () => {
    try {
      const newPeer = new window.Peer();
      
      newPeer.on('open', (id) => {
        console.log('My student Peer ID:', id);
        setStatus('Connecting to Doctor...');
        connectToDoctor(newPeer);
      });

      newPeer.on('call', (call) => {
        console.log('Incoming CALL from doctor');
        setStatus('Receiving stream...');
        call.answer(); 
        call.on('stream', (stream) => {
          console.log('SUCCESS: Stream received from doctor call');
          setRemoteStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        });
      });

      newPeer.on('error', (err) => {
        console.error('Peer error:', err);
        setStatus('Connection error: ' + err.type);
      });

      setPeer(newPeer);
    } catch (err) {
      console.error('Failed to init PeerJS:', err);
      setStatus('Failed to load connection library');
    }
  }

  const connectToDoctor = (currentPeer) => {
    const doctorPeerId = `evo-lecture-${lectureId}`;
    console.log('Connecting to doctor:', doctorPeerId);
    
    // 1. Data Connection (Chat & Signaling)
    const newConn = currentPeer.connect(doctorPeerId);
    
    newConn.on('open', () => {
      console.log('Data connection opened');
      setStatus('Requesting stream...');
      setConn(newConn);
      connRef.current = newConn;
      setIsLive(true);
      
      // Request stream from doctor
      newConn.send({ type: 'request-stream', peerId: currentPeer.id });
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'System', 
        text: 'Connected. Stream requested.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        isInstructor: true 
      }]);
    });

    newConn.on('data', (data) => {
      if (data.type === 'chat') {
        setMessages(prev => [...prev, {
          id: data.id || Date.now(),
          sender: data.sender,
          text: data.text,
          time: data.time,
          isInstructor: data.isInstructor
        }]);
      }
    });

    newConn.on('error', (err) => {
      console.error('Connection error:', err);
      setStatus('Retry in 5s...');
      setTimeout(() => connectToDoctor(currentPeer), 5000);
    });
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !connRef.current) return

    const message = {
      type: 'chat',
      id: Date.now(),
      sender: studentName,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInstructor: false
    }

    setMessages(prev => [...prev, { ...message, sender: 'You' }])
    connRef.current.send(message);
    setNewMessage('')
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#1a1a2e', minHeight: '100vh', color: '#fff' }}>
      
      {/* Header section */}
      <div className="d-flex align-items-center mb-4" style={{ gap: '15px' }}>
        <button onClick={() => router.back()} className="btn text-info d-flex align-items-center" style={{ background: 'none', border: 'none' }}>
          <ArrowLeftIcon size={24} style={{ marginRight: '8px' }} />
          Back
        </button>
        <h2 style={{color: '#6fc3ff', fontWeight: 'bold', margin: '0'}}>Live Lecture</h2>
        <div style={{
          backgroundColor: isLive ? '#ff6b6b' : '#4a5568',
          color: 'white',
          padding: '5px 15px',
          borderRadius: '20px',
          fontWeight: 'bold',
          marginLeft: 'auto'
        }}>
          {isLive ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>

      <div className="row g-4 h-100">
        <div className="col-lg-8">
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
            position: 'relative'
          }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: remoteStream ? 'block' : 'none' }}
            />
            
            {!remoteStream && (
              <div style={{ textAlign: 'center', color: '#6fc3ff' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📡</div>
                <h4>{status}</h4>
                <p style={{ opacity: 0.6 }}>Waiting for stream data from instructor...</p>
                {isLive && (
                  <button 
                    onClick={() => {
                      if (connRef.current) connRef.current.send({ type: 'request-stream', peerId: peer.id });
                    }}
                    className="btn btn-outline-info btn-sm mt-2"
                  >
                    Manual Refresh Stream
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 p-3" style={{ backgroundColor: '#162447', borderRadius: '12px', border: '1px solid #6fc3ff' }}>
            <h4 style={{ color: '#c19a6b' }}>Dr. Sherif Ibrahim</h4>
            <p>Mechatronics Systems - Introduction to Feedback Loops</p>
          </div>
        </div>

        <div className="col-lg-4">
          <div style={{ backgroundColor: '#162447', border: '1px solid #6fc3ff', borderRadius: '12px', height: '600px', display: 'flex', flexDirection: 'column' }}>
            <div className="p-3 border-bottom border-info">
              <h5 className="m-0 text-info">Live Chat</h5>
            </div>
            
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <small style={{ color: msg.isInstructor ? '#c19a6b' : '#6fc3ff' }}>{msg.sender}</small>
                  <div style={{ backgroundColor: msg.sender === 'You' ? '#2a4365' : '#1a1a2e', padding: '8px 12px', borderRadius: '10px', marginTop: '4px' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-top border-info d-flex gap-2">
              <input 
                type="text" 
                className="form-control bg-transparent text-white border-secondary"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!isLive}
              />
              <button type="submit" className="btn btn-primary" disabled={!isLive}>
                <SendIcon size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
