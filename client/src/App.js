// src/App.js
import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

// Import components
import Dashboard from './components/Dashboard';
import UploadForm from './components/UploadForm';
import CalendarEvents from './components/CalendarEvents';
import AgreementsList from './components/AgreementsList';
import VisualCalendar from './components/VisualCalendar';

// Import API service
import { api } from './services/api';

// Import utilities and styles
import { getDaysUntil } from './utils/dateHelpers';
import { styles } from './styles/styles';
import Notification from './components/Notification';

const App = () => {
  const [agreements, setAgreements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedAgreementId, setHighlightedAgreementId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [agreementsData, eventsData] = await Promise.all([
        api.getAgreements(),
        api.getCalendar()
      ]);
      
      setAgreements(agreementsData);
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Make sure the backend is running on localhost:5000');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSuccess = (result) => {
    loadData();
    // Success notification is now handled in UploadForm component
  };

  const handleEventClick = (agreementId) => {
    setHighlightedAgreementId(agreementId);
  };

  const handleHighlightClear = () => {
    setHighlightedAgreementId(null);
  };

  const handleDeleteAgreement = async (agreementId) => {
    try {
      const agreementToDelete = agreements.find(a => a.id === agreementId);
      await api.deleteAgreement(agreementId);
      
      // Refresh data after successful deletion
      await loadData();
      
      // Show success notification
      showNotification('success', `Successfully deleted ${agreementToDelete?.vendor || 'the'} agreement`);
      
      // Clear any highlight if the deleted agreement was highlighted
      if (highlightedAgreementId === agreementId) {
        setHighlightedAgreementId(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showNotification('error', `Failed to delete agreement: ${error.message}`);
      throw error; // Re-throw so the component can handle loading states
    }
  };

  const handleEditAgreement = async (agreementId, agreementData) => {
    try {
      const agreementToEdit = agreements.find(a => a.id === agreementId);
      const response = await api.updateAgreement(agreementId, agreementData);
      
      // Refresh data after successful edit
      await loadData();
      
      // Show success notification with calendar update info
      let message = `Successfully updated ${agreementData.vendor} agreement`;
      if (response.calendar_updated) {
        message += ' and refreshed calendar events';
      }
      showNotification('success', message);
      
    } catch (error) {
      console.error('Edit failed:', error);
      showNotification('error', `Failed to update agreement: ${error.message}`);
      throw error; // Re-throw so the component can handle loading states
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={styles.spinner}></div>
          <span style={{ marginLeft: '0.5rem', fontSize: '1.125rem' }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <div style={styles.errorCard}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={20} style={{ marginRight: '0.5rem' }} />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Filter upcoming events (next 90 days)
  const upcomingEvents = events.filter(event => {
    const daysUntil = getDaysUntil(event.date);
    return daysUntil <= 90 && daysUntil >= 0;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Filter all future events (today and beyond)
  const futureEvents = events.filter(event => {
    const daysUntil = getDaysUntil(event.date);
    return daysUntil >= 0;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Calendar size={32} color="#3b82f6" />
          <div>
            <h1 style={styles.headerTitle}>BRM Renewal Calendar</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Global Notifications */}
        {notification && (
          <div style={{ marginBottom: '1rem' }}>
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={hideNotification}
            />
          </div>
        )}

        {/* Dashboard Stats */}
        <Dashboard agreements={agreements} events={events} />

        {/* Visual Calendar and Events Side by Side */}
        <div style={{ ...styles.grid, ...styles.gridCols2, marginBottom: '2rem' }}>
          <VisualCalendar 
            events={futureEvents} 
            onEventClick={handleEventClick}
          />
          <CalendarEvents 
            events={upcomingEvents} 
            title="Upcoming Events (90 days)"
            defaultExpanded={true}
            onEventClick={handleEventClick}
          />
        </div>

        {/* All Future Events */}
        <div style={{ marginBottom: '2rem' }}>
          <CalendarEvents 
            events={futureEvents} 
            title="All Future Events"
            defaultExpanded={false}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Upload Form */}
        <div style={{ marginBottom: '2rem' }}>
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Agreements List */}
        <AgreementsList 
          agreements={agreements} 
          highlightedAgreementId={highlightedAgreementId}
          onHighlightClear={handleHighlightClear}
          onDeleteAgreement={handleDeleteAgreement}
          onEditAgreement={handleEditAgreement}
        />
      </main>
    </div>
  );
};

export default App;