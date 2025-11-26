import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal component
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnOverlayClick = true 
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className={`
              relative bg-white rounded-lg shadow-xl w-full
              ${sizeClasses[size]}
              transform transition-all
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;