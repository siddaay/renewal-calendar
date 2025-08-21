// src/components/Notification.jsx
import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { styles } from '../styles/styles';

const Notification = ({ type = 'info', message, onClose, autoHide = true }) => {
  React.useEffect(() => {
    if (autoHide && onClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />;
      case 'error':
        return <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />;
      case 'info':
      default:
        return <Info size={16} style={{ marginRight: '0.5rem' }} />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return styles.notificationSuccess;
      case 'error':
        return styles.notificationError;
      case 'info':
      default:
        return styles.notificationInfo;
    }
  };

  return (
    <div style={{
      ...styles.notification,
      ...getTypeStyles()
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {getIcon()}
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          style={styles.closeButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Notification;