'use client'
import '@/styles/doctor.css'

import { useState, useEffect, useRef } from 'react'
import Header from '@/app/components/Header'
import CircularMenu from '@/app/components/CircularMenu'
import api from '@/lib/api'
import CloudinaryUploadZone from './CloudinaryUploadZone'

export default function VideosPage() {
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [uploadStatus, setUploadStatus] = useState('')
    const [videoTitle, setVideoTitle] = useState('')
    
    const [courses, setCourses] = useState([])
    const [selectedCourseId, setSelectedCourseId] = useState('')

    // Refs to avoid stale closures in Cloudinary callback
    const titleRef = useRef(videoTitle);
    const courseIdRef = useRef(selectedCourseId);
    const coursesRef = useRef(courses);

    useEffect(() => { titleRef.current = videoTitle; }, [videoTitle]);
    useEffect(() => { courseIdRef.current = selectedCourseId; }, [selectedCourseId]);
    useEffect(() => { coursesRef.current = courses; }, [courses]);

    useEffect(() => {
        const doctorId = localStorage.getItem('userId')
        if (doctorId) {
            // 1. Fetch Courses
            api.doctors.getCourses(doctorId).then(res => {
                if (res.status === 'success' && res.data) {
                    setCourses(res.data)
                    if (res.data.length > 0) setSelectedCourseId(res.data[0].id)
                }
            }).catch(err => console.error("Error fetching courses", err))

            // 2. Fetch Existing Lectures (Videos)
            api.request(`/lecture/doctor/${doctorId}`).then(res => {
                if (res.status === 'success') {
                    const mapped = res.data.map(l => ({
                        id: l.id,
                        title: l.title,
                        size: l.size || 'N/A',
                        date: new Date(l.created_at).toLocaleDateString(),
                        status: l.status === 'Recorded' ? 'Published ✅' : l.status,
                        subject: l.course_name,
                        url: l.url
                    }));
                    setUploadedFiles(mapped)
                }
            }).catch(err => console.error("Error fetching lectures", err))
        }
    }, [])

    useEffect(() => {
        const handleMouseMove = (e) => {
            const glow = document.getElementById('cursor-glow')
            if (glow) {
                glow.style.left = e.clientX + 'px'
                glow.style.top = e.clientY + 'px'
            }
        }
        document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    const handleCloudinarySuccess = async (result) => {
        const doctorId = localStorage.getItem('userId');
        const { secure_url, bytes } = result.info;
        const sizeMB = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        
        const currentTitle = titleRef.current;
        const currentCourseId = courseIdRef.current;
        const currentCourses = coursesRef.current;

        const courseName = currentCourses.find(c => c.id == currentCourseId)?.name || 'Unknown Course';
        const finalTitle = currentTitle || 'Untitled Video';

        const newFile = {
            id: Date.now() + Math.random(),
            title: finalTitle,
            size: sizeMB,
            date: new Date().toLocaleDateString(),
            status: 'Uploaded ✅',
            subject: courseName,
            url: secure_url
        };

        setUploadedFiles((prev) => [newFile, ...prev]);
        setUploadStatus('Saving to Database... ⏳');
        
        try {
            await api.doctors.uploadVideo(doctorId, {
                course_id: currentCourseId,
                title: finalTitle,
                folder_url: secure_url,
                file_size: sizeMB
            });
            setUploadStatus('Video uploaded successfully! 🎥');
        } catch (error) {
            console.error('Error saving to db:', error);
            setUploadStatus('⚠️ Uploaded to Cloudinary, but database sync failed.');
        }

        setTimeout(() => setUploadStatus(''), 5000);
        setVideoTitle('');
    };

    const deleteFile = (id) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
    }

    return (
        <>
            <div id="cursor-glow"></div>

            <Header title="Video Lectures" />

            <div className="main-content container-fluid p-4" style={{ maxWidth: '1200px' }}>

                {/* Page Title */}
                <div className="text-center my-4">
                    <h1 style={{ color: '#2b3a55', fontWeight: 800, fontSize: '2.8rem' }}>
                        <i className="bi bi-camera-reels me-3" style={{ color: '#c4a16b' }}></i>
                        Video Lectures Manager
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#666', fontWeight: 500 }}>
                        Upload, manage, and publish high-quality video content for your students
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="row g-4 mb-5">
                    <div className="col-md-4">
                        <div className="p-4 d-flex flex-column justify-content-center align-items-center text-center text-white position-relative stat-card-anim" style={{ background: '#3a4f6d', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 6px 20px rgba(58,79,109,0.25)', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default', minHeight: '150px' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.15, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
                            <i className="bi bi-collection-play-fill position-absolute" style={{ fontSize: '8rem', right: '-20px', bottom: '-40px', opacity: 0.05, transform: 'rotate(-15deg)' }}></i>
                            <div className="position-relative z-1 w-100">
                                <i className="bi bi-camera-video-fill mb-3 d-block" style={{ opacity: 0.9, fontSize: '2.5rem' }}></i>
                                <div>
                                    <h6 style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 500 }}>Total Videos</h6>
                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.8rem' }}>{uploadedFiles.length}</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="p-4 d-flex flex-column justify-content-center align-items-center text-center text-white position-relative stat-card-anim" style={{ background: 'linear-gradient(135deg, #b8905a, #d4ab7a)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 6px 20px rgba(196,161,107,0.3)', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default', minHeight: '150px' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.1, backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }}></div>
                            <i className="bi bi-cloud-arrow-up-fill position-absolute" style={{ fontSize: '8rem', right: '-10px', bottom: '-40px', opacity: 0.08, transform: 'rotate(-10deg)' }}></i>
                            <div className="position-relative z-1 w-100">
                                <i className="bi bi-hdd-network-fill mb-3 d-block" style={{ opacity: 0.9, fontSize: '2.5rem' }}></i>
                                <div>
                                    <h6 style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 500 }}>Storage Used</h6>
                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.8rem' }}>{(uploadedFiles.length * 45.5).toFixed(1)} MB</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="p-4 d-flex flex-column justify-content-center align-items-center text-center text-white position-relative stat-card-anim" style={{ background: 'linear-gradient(135deg, #7a94ae, #a0bcd4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 6px 20px rgba(140,163,186,0.3)', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default', minHeight: '150px' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.15, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', pointerEvents: 'none' }}></div>
                            <i className="bi bi-journals position-absolute" style={{ fontSize: '8rem', right: '-20px', bottom: '-30px', opacity: 0.08, transform: 'rotate(10deg)' }}></i>
                            <div className="position-relative z-1 w-100">
                                <i className="bi bi-activity mb-3 d-block" style={{ opacity: 0.9, fontSize: '2.5rem' }}></i>
                                <div>
                                    <h6 style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 500 }}>Active Courses</h6>
                                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.8rem' }}>{courses.length}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Upload Form */}
                <div className="row mb-5 g-4">
                    {/* Form Settings Column */}
                    <div className="col-lg-5">
                        <div className="p-4 h-100" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.4))', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                            <h4 style={{ color: '#2b3a55', fontWeight: 700, marginBottom: '20px' }}>Video Details</h4>

                            <div className="mb-3">
                                <label style={{ fontWeight: 600, color: '#555', marginBottom: '8px' }}>Lecture Title</label>
                                <input
                                    type="text"
                                    className="form-control p-3"
                                    placeholder="e.g. Intro to Robotics"
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                    style={{ borderRadius: '10px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.9)' }}
                                />
                            </div>

                            <div className="mb-4">
                                <label style={{ fontWeight: 600, color: '#555', marginBottom: '10px', display: 'block' }}>Select Course</label>
                                {courses.length > 0 ? (
                                    <select 
                                        className="form-select p-3"
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        style={{ borderRadius: '10px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}
                                    >
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem', padding: '8px 0' }}>No courses assigned to you.</div>
                                )}
                            </div>

                            <div className="p-3 mt-4 text-center rounded" style={{ background: 'rgba(58, 79, 109, 0.05)', border: '1px solid rgba(58, 79, 109, 0.1)' }}>
                                <i className="bi bi-server me-2 text-primary"></i> <span style={{ fontWeight: 600, color: '#3a4f6d' }}>Database Sync Ready</span>
                                <p className="mt-2 text-muted mb-0" style={{ fontSize: '0.9rem' }}>Files will be sent directly to the secure video server bucket.</p>
                            </div>
                        </div>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div className="col-lg-7">
                        <style dangerouslySetInnerHTML={{
                            __html: `
              @keyframes pulse-border {
                0% { box-shadow: 0 0 0 0 rgba(196, 161, 107, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(196, 161, 107, 0); }
                100% { box-shadow: 0 0 0 0 rgba(196, 161, 107, 0); }
              }
              .upload-area-animated {
                animation: pulse-border 2.5s infinite;
              }
              .upload-area-animated:hover {
                animation: none;
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(0,0,0,0.08) !important;
              }
            `}} />
                        <CloudinaryUploadZone
                            onSuccess={handleCloudinarySuccess}
                            selectedCourseId={selectedCourseId}
                            onMissingCourse={() => setUploadStatus('⚠️ Please select a course before uploading.')}
                        />
                    </div>
                </div>

                {uploadStatus && (
                    <div className="alert alert-success text-center fw-bold py-3 mb-5" style={{ borderRadius: '12px', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(40,167,69,0.2)' }}>
                        {uploadStatus}
                    </div>
                )}

                {/* Uploaded Videos List */}
                {uploadedFiles.length > 0 && (
                    <div className="mb-5">
                        <h4 className="mb-4" style={{ color: '#2b3a55', fontWeight: 700 }}>
                            <i className="bi bi-collection-play me-2"></i> Recent Uploads Queue
                        </h4>
                        <div className="row g-4">
                            {uploadedFiles.map((file) => (
                                <div key={file.id} className="col-md-6 col-lg-4">
                                    <div className="p-0" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        {/* Thumbnail Placeholder */}
                                        <div style={{ background: 'linear-gradient(45deg, #2b3a55, #3a4f6d)', height: '150px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "url('/Pics/11.png')", opacity: 0.2, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}></div>
                                            <i className="bi bi-play-circle-fill text-white position-relative z-1" style={{ fontSize: '3.5rem', cursor: 'pointer', transition: 'transform 0.2s', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}></i>
                                        </div>

                                        <div className="p-4 d-flex flex-column flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h5 style={{ color: '#2b3a55', fontWeight: 700, fontSize: '1.15rem', marginBottom: '6px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.title}</h5>
                                                    <div className="d-flex gap-2 flex-wrap mb-2">
                                                        <span className="badge" style={{ background: 'rgba(43,58,85,0.1)', color: '#2b3a55', fontSize: '0.75rem' }}>Course</span>
                                                    </div>
                                                </div>
                                                <button className="btn btn-sm btn-light text-danger shadow-sm ms-2" onClick={() => deleteFile(file.id)} style={{ borderRadius: '8px' }}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>

                                            <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '15px', fontWeight: 500 }}>
                                                <i className="bi bi-journal-bookmark me-1" style={{ color: '#c4a16b' }}></i> {file.subject}
                                            </p>

                                            <div className="mt-auto d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                                <span style={{ color: '#888', fontSize: '0.8rem' }}><i className="bi bi-file-earmark-play-fill me-1"></i> {file.size}</span>
                                                <span className="text-success" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                    <i className="bi bi-cloud-check-fill me-1"></i> {file.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

        <CircularMenu />
        
        </>
    )
}
