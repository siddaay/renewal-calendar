// src/components/CalendarEvents.jsx
import React, { useState } from 'react';
import { Calendar, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate, getDaysUntil } from '../utils/dateHelpers';
import { styles } from '../styles/styles';

const getEventCardStyle = (type, isClickable = false) => {
  const baseStyle = (() => {
    switch (type) {
      case 'notice_deadline':
        return { ...styles.eventCard, ...styles.eventCardYellow };
      case 'renewal_date':
        return { ...styles.eventCard, ...styles.eventCardBlue };
      case 'expiration_date':
        return { ...styles.eventCard, ...styles.eventCardRed };
      default:
        return styles.eventCard;
    }
  })();

  if (isClickable) {
    return {
      ...baseStyle,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }
    };
  }

  return baseStyle;
};

const CalendarEvents = ({ events, title, defaultExpanded = true, onEventClick }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event.agreement_id);
    }
  };

  // Filter out past events
  const futureEvents = events ? events.filter(event => {
    const daysUntil = getDaysUntil(event.date);
    return daysUntil >= 0; // Keep events that are today or in the future
  }) : [];

  if (!futureEvents || futureEvents.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <Calendar size={20} />
          <h2 style={styles.cardTitle}>{title}</h2>
        </div>
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>No upcoming events</p>
      </div>
    );
  }

  // Get urgency counts for summary (using filtered events)
  const urgentCount = futureEvents.filter(event => {
    const daysUntil = getDaysUntil(event.date);
    return daysUntil <= 30 && daysUntil >= 0;
  }).length;

  const upcomingCount = futureEvents.filter(event => {
    const daysUntil = getDaysUntil(event.date);
    return daysUntil <= 90 && daysUntil >= 0;
  }).length;

  const isClickable = !!onEventClick;

  return (
    <div style={styles.card}>
      <div 
        style={{ 
          ...styles.cardHeader, 
          cursor: 'pointer',
          borderRadius: '0.375rem',
          padding: '0.5rem',
          margin: '-0.5rem -0.5rem 1rem -0.5rem',
          transition: 'background-color 0.2s'
        }}
        onClick={toggleExpanded}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <Calendar size={20} />
        <h2 style={{ ...styles.cardTitle, flex: 1 }}>
          {title} ({futureEvents.length})
        </h2>
        
        {/* Summary when collapsed */}
        {!isExpanded && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            marginRight: '0.5rem'
          }}>
            {urgentCount > 0 && (
              <span style={{ color: '#ef4444', fontWeight: '500' }}>
                {urgentCount} urgent
              </span>
            )}
          </div>
        )}
        
        {isExpanded ? (
          <ChevronUp size={20} style={{ color: '#6b7280' }} />
        ) : (
          <ChevronDown size={20} style={{ color: '#6b7280' }} />
        )}
      </div>
      
      {isExpanded && (
        <div style={styles.eventsList}>
          {futureEvents.map((event) => {
            const daysUntil = getDaysUntil(event.date);
            const isUrgent = daysUntil <= 30 && daysUntil >= 0;
            
            return (
              <div 
                key={event.id} 
                style={getEventCardStyle(event.type, isClickable)}
                onClick={() => handleEventClick(event)}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isClickable) {
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                title={isClickable ? `Click to view ${event.vendor} agreement details` : undefined}
              >
                <div style={styles.eventHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.eventVendor}>
                      {event.vendor}
                      {isUrgent && <AlertCircle size={16} color="#ef4444" style={{ marginLeft: '0.5rem' }} />}
                    </div>
                    
                    <p style={styles.eventDescription}>{event.description}</p>
                    
                    {event.type === 'notice_deadline' && daysUntil > 0 && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                        <Clock size={14} style={{ marginRight: '0.25rem' }} />
                        <span style={{ fontWeight: isUrgent ? '600' : 'normal' }}>
                          {daysUntil} days to act
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.eventDate}>
                    <div style={styles.eventDateValue}>{formatDate(event.date)}</div>
                    <div style={styles.eventDateType}>
                      {event.type.replace('_', ' ')}
                    </div>
                    {event.is_recurring && (
                      <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>
                        🔄 Recurring
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarEvents;