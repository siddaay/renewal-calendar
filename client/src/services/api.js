// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = {
  // Health check
  health: () => fetch(`${API_BASE_URL}/health`).then(res => res.json()),
  
  // Upload PDF
  uploadPDF: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  // Get agreements
  getAgreements: () => 
    fetch(`${API_BASE_URL}/agreements`).then(res => res.json()),
  
  // Get calendar events
  getCalendar: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return fetch(`${API_BASE_URL}/calendar?${params}`)
      .then(res => res.json());
  },
  
  // Get upcoming events
  getUpcoming: () => 
    fetch(`${API_BASE_URL}/calendar/upcoming`).then(res => res.json()),

  // Delete agreement
  deleteAgreement: (agreementId) => 
    fetch(`${API_BASE_URL}/agreements/${agreementId}`, {
      method: 'DELETE',
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to delete agreement');
      }
      return res.json();
    }),

  // Update agreement
  updateAgreement: (agreementId, agreementData) => 
    fetch(`${API_BASE_URL}/agreements/${agreementId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agreementData),
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to update agreement');
      }
      return res.json();
    }),
};