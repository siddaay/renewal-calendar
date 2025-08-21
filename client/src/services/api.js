const API_BASE_URL = process.env.REACT_APP_API_URL

export const api = {
  getAgreements: () => fetch(`${API_URL}/agreements`).then(res => res.json()),
  getCalendar: () => fetch(`${API_URL}/calendar`).then(res => res.json()),
  uploadPDF: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  }
};