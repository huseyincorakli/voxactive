"use client"
import Link from 'next/link';
import { useState, useRef } from 'react';

export default function NotFound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      
      <div style={{ position: 'relative', margin: '20px 0' }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          style={{
            maxWidth: '100%',
            maxHeight: '60vh',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <source src="/notfound.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <button
          onClick={togglePlayPause}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      
      <Link href="/">Return Home</Link>
    </div>
  );
}