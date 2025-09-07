import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StoryboardImage } from '../types';
import { CloseIcon, ZoomInIcon, ZoomOutIcon, RotateCwIcon, FullscreenIcon } from './Icons';

interface ImageLightboxProps {
  image: StoryboardImage;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
    if (event.key === '+') setZoom(z => Math.min(z + 0.1, 3));
    if (event.key === '-') setZoom(z => Math.max(z - 0.1, 0.2));
    if (event.key === 'r' || event.key === 'R') setRotation(r => r + 90);
  }, [onClose]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.2, Math.min(3, z - e.deltaY * 0.001)));
  };

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
        onWheel={handleWheel}
    >
        <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img
                src={image.url}
                alt={image.prompt}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
            />
        </div>

        {/* Toolbar */}
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-brand-gray/80 rounded-lg border border-brand-mid-gray shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
            <button onClick={() => setZoom(z => z + 0.1)} title="Zoom In (+)" className="p-2 text-white hover:bg-brand-mid-gray rounded-md transition-colors"><ZoomInIcon /></button>
            <button onClick={() => setZoom(z => z - 0.1)} title="Zoom Out (-)" className="p-2 text-white hover:bg-brand-mid-gray rounded-md transition-colors"><ZoomOutIcon /></button>
            <button onClick={() => setRotation(r => r + 90)} title="Rotate (R)" className="p-2 text-white hover:bg-brand-mid-gray rounded-md transition-colors"><RotateCwIcon /></button>
            <button onClick={toggleFullScreen} title="Fullscreen" className="p-2 text-white hover:bg-brand-mid-gray rounded-md transition-colors"><FullscreenIcon /></button>
            <button onClick={onClose} title="Close (Esc)" className="p-2 text-white hover:bg-brand-mid-gray rounded-md transition-colors"><CloseIcon /></button>
        </div>
    </div>
  );
};
