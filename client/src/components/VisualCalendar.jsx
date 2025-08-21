// src/components/VisualCalendar.jsx
import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, FileText } from 'lucide-react';
import { getDaysUntil } from '../utils/dateHelpers';
import { styles } from '../styles/styles';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const VisualCalendar = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Days to show from previous month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks)
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const isCurrentMonth = currentDay.getMonth() === month;
      const isToday = currentDay.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && currentDay.toDateString() === selectedDate.toDateString();
      
      // Find events for this date
      const dayEvents = events.filter(event => event.date === dateStr);
      
      days.push({
        date: new Date(currentDay),
        dateStr,
        day: currentDay.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        events: dayEvents
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  }, [currentDate, events, selectedDate]);

  // Get events for selected date
  const selectedDateEvents = selectedDate 
    ? events.filter(event => event.date === selectedDate.toISOString().split('T')[0])
    : [];

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'notice_deadline':
        return '#f59e0b'; // Yellow/orange
      case 'renewal_date':
        return '#3b82f6'; // Blue
      case 'expiration_date':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'notice_deadline':
        return <Clock size={12} />;
      case 'renewal_date':
        return <FileText size={12} />;
      case 'expiration_date':
        return <AlertCircle size={12} />;
      default:
        return <Calendar size={12} />;
    }
  };

  const handleDateClick = (dayData) => {
    setSelectedDate(dayData.date);
  };

  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event.agreement_id);
    }
  };

  return (
    <div style={styles.card}>
      {/* Calendar Header */}
      <div style={styles.cardHeader}>
        <Calendar size={20} />
        <h2 style={styles.cardTitle}>Calendar View</h2>
      </div>

      {/* Month Navigation */}
      <div 
        className="calendar-nav"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.375rem'
        }}
      >
        <div 
          className="calendar-month-nav"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <button
            onClick={goToPreviousMonth}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            textAlign: 'center',
            flex: 1
          }}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>

          <button
            onClick={goToNextMonth}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        <button
          onClick={goToToday}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div 
        className="calendar-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.375rem',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}
      >
        {/* Day Headers */}
        {DAYS.map(day => (
          <div
            key={day}
            style={{
              backgroundColor: '#f3f4f6',
              padding: '0.75rem 0.25rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#374151'
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarData.map((dayData, index) => (
          <div
            key={index}
            className="calendar-day"
            onClick={() => handleDateClick(dayData)}
            style={{
              backgroundColor: dayData.isSelected ? '#dbeafe' : 'white',
              minHeight: '80px',
              padding: '0.5rem 0.25rem',
              cursor: 'pointer',
              border: dayData.isToday ? '2px solid #3b82f6' : 'none',
              opacity: dayData.isCurrentMonth ? 1 : 0.3,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              if (!dayData.isSelected) {
                e.target.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (!dayData.isSelected) {
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            {/* Day Number */}
            <div 
              className="calendar-day-number"
              style={{
                fontSize: '0.875rem',
                fontWeight: dayData.isToday ? '600' : '500',
                color: dayData.isToday ? '#3b82f6' : '#374151',
                marginBottom: '0.25rem'
              }}
            >
              {dayData.day}
            </div>

            {/* Event Indicators */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
              flex: 1
            }}>
              {dayData.events.slice(0, 3).map((event, eventIndex) => {
                const isUrgent = getDaysUntil(event.date) <= 30;
                return (
                  <div
                    key={event.id}
                    className="calendar-event"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    style={{
                      backgroundColor: getEventTypeColor(event.type),
                      color: 'white',
                      fontSize: '0.625rem',
                      padding: '1px 3px',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: isUrgent ? '600' : '500'
                    }}
                    title={`${event.vendor} - ${event.description}`}
                  >
                    {getEventTypeIcon(event.type)}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.vendor}
                    </span>
                  </div>
                );
              })}
              
              {/* Show "+N more" if there are more events */}
              {dayData.events.length > 3 && (
                <div style={{
                  fontSize: '0.625rem',
                  color: '#6b7280',
                  fontWeight: '500',
                  padding: '1px 3px'
                }}>
                  +{dayData.events.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Date Events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          padding: '1rem'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Calendar size={16} style={{ marginRight: '0.5rem' }} />
            Events for {selectedDate.toLocaleDateString()}
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedDateEvents.map(event => {
              const isUrgent = getDaysUntil(event.date) <= 30;
              return (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  style={{
                    backgroundColor: 'white',
                    border: `1px solid ${getEventTypeColor(event.type)}`,
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    cursor: onEventClick ? 'pointer' : 'default',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      color: getEventTypeColor(event.type),
                      marginRight: '0.5rem'
                    }}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '0.875rem'
                      }}>
                        {event.vendor}
                        {isUrgent && (
                          <span style={{
                            marginLeft: '0.5rem',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            URGENT
                          </span>
                        )}
                      </div>
                      <div style={{
                        color: '#6b7280',
                        fontSize: '0.75rem'
                      }}>
                        {event.description}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textAlign: 'right'
                  }}>
                    {event.type.replace('_', ' ')}
                    {event.is_recurring && (
                      <div>🔄 Recurring</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {[
          { type: 'notice_deadline', label: 'Notice Deadline' },
          { type: 'renewal_date', label: 'Renewal Date' },
          { type: 'expiration_date', label: 'Expiration Date' }
        ].map(({ type, label }) => (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: getEventTypeColor(type),
              borderRadius: '2px',
              marginRight: '0.5rem'
            }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisualCalendar;