// src/components/UploadForm.jsx
import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { api } from '../services/api';
import { styles } from '../styles/styles';
import Notification from './Notification';

const UploadForm = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: string }

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      showNotification('error', 'Please upload a PDF file');
      return;
    }

    setUploading(true);
    setNotification(null); // Clear any existing notifications
    
    try {
      const result = await api.uploadPDF(file);
      if (result.message) {
        showNotification('success', `Successfully processed ${result.agreement?.vendor || 'the'} agreement!`);
        onUploadSuccess(result);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      showNotification('error', `Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <Upload size={20} />
        <h2 style={styles.cardTitle}>Upload Purchase Agreement</h2>
      </div>

      {/* Notification Banner */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
      
      <div
        style={{
          ...styles.uploadArea,
          ...(dragOver ? styles.uploadAreaHover : {}),
          ...(uploading ? { opacity: 0.7, pointerEvents: 'none' } : {})
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && document.getElementById('file-upload').click()}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={styles.spinner}></div>
            <span style={{ marginLeft: '0.5rem' }}>Processing PDF...</span>
          </div>
        ) : (
          <>
            <FileText size={48} style={styles.uploadIcon} />
            <p style={styles.uploadTitle}>
              Drop your PDF here or click to browse
            </p>
            <p style={styles.uploadSubtitle}>
              Support for purchase agreements, subscription orders, and contracts
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <button style={styles.uploadButton}>
              Choose PDF File
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadForm;