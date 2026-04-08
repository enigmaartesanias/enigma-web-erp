import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen || !imageUrl) return null;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackgroundClick = (e) => {
    // Si la clase del elemento clickeado indica que es el wrapper, cerramos
    if (typeof e.target.className === 'string' && e.target.className.includes('zoom-wrapper-bg')) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-95 touch-none zoom-wrapper-bg"
      style={{ zIndex: 99999, backdropFilter: 'blur(12px)' }}
      onClick={handleBackgroundClick}
    >
      <button
        className="absolute top-4 right-4 p-3 rounded-full bg-gray-800 bg-opacity-70 text-white transition-all duration-300 shadow-xl border border-gray-600"
        style={{ zIndex: 100000 }}
        onClick={onClose}
        title="Cerrar visor"
        aria-label="Cerrar visor"
      >
        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Visor de imagen en pantalla completa */}
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={8} // Permite un zoom mucho más profundo
        centerOnInit={true}
        limitToBounds={true} // Asegura que la imagen no navegue fuera del visor
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <TransformComponent
            wrapperClass="w-full zoom-wrapper-bg cursor-move"
            wrapperStyle={{ height: '100dvh' }}
            contentClass="flex items-center justify-center transition-transform"
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <img
              src={imageUrl}
              alt="Imagen ampliada del producto en pantalla completa"
              className="object-contain pointer-events-auto select-none"
              style={{ 
                width: '100%',
                height: '100%',
                maxHeight: '100dvh',
                WebkitUserDrag: 'none'
              }}
              onClick={(e) => {
                // Previene cerrar al tocar la imagen
                e.stopPropagation();
              }}
            />
          </TransformComponent>
        )}
      </TransformWrapper>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageModal;