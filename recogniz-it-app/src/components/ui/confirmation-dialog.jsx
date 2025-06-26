import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle, Trash2 } from 'lucide-react';
import './confirmation-dialog.css';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning", // warning, danger, info, success
  isLoading = false 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="confirmation-dialog-icon" style={{ width: '2rem', height: '2rem', color: '#ef4444' }} />;
      case 'success':
        return <CheckCircle className="confirmation-dialog-icon" style={{ width: '2rem', height: '2rem', color: '#10b981' }} />;
      case 'info':
        return <Info className="confirmation-dialog-icon" style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />;
      default:
        return <AlertTriangle className="confirmation-dialog-icon" style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} />;
    }
  };

  return (
    <div className="confirmation-dialog-overlay">
      {/* Backdrop */}
      <div 
        className="confirmation-dialog-backdrop"
        onClick={onClose}
      />
      
      {/* Dialog Container */}
      <div className="confirmation-dialog-container">
        <div className="confirmation-dialog-content">
          {/* Header with gradient background */}
          <div className={`confirmation-dialog-header confirmation-dialog-header-${type}`}>
            <div className="confirmation-dialog-header-content">
              <div className="confirmation-dialog-title-section">
                <div className="confirmation-dialog-icon">
                  {getIcon()}
                </div>
                <h3 className="confirmation-dialog-title">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="confirmation-dialog-close"
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="confirmation-dialog-body">
            <p className="confirmation-dialog-message">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="confirmation-dialog-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="confirmation-dialog-button confirmation-dialog-button-cancel"
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`confirmation-dialog-button confirmation-dialog-button-confirm confirmation-dialog-button-confirm-${type}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="confirmation-dialog-loading">
                  <div className="loading-spinner"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 