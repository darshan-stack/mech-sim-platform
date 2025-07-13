import React, { useRef, useState } from 'react';

export default function FullscreenCanvasWrapper({ children, height = 300 }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef(null);

  function handleFullscreen() {
    if (wrapperRef.current) {
      if (!isFullscreen) {
        if (wrapperRef.current.requestFullscreen) {
          wrapperRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative bg-gray-100 rounded ${isFullscreen ? 'z-50' : ''}`} style={{ height: isFullscreen ? '100vh' : height }}>
      <button
        onClick={handleFullscreen}
        className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded hover:bg-opacity-80"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? '⤫' : '⛶'}
      </button>
      {children}
    </div>
  );
}
