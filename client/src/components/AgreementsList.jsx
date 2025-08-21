// src/components/AgreementsList.jsx
import React, { useRef, useEffect, useState } from 'react';
import { FileText, AlertTriangle, Trash2, Edit3, X, Save } from 'lucide-react';
import { formatDate, formatCurrency, isAgreementExpired } from '../utils/dateHelpers';
import { styles } from '../styles/styles';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, agreementVendor }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        maxWidth: '400px',
        margin: '1rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            Delete Agreement
          </h3>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>
        
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Are you sure you want to delete the <strong>{agreementVendor}</strong> agreement? 
          This will also remove all associated calendar events. This action cannot be undone.
        </p>
        
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.375rem',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Delete Agreement
          </button>
        </div>
      </div>
    </div>
  );
};

const EditDialog = ({ isOpen, onSave, onCancel, agreement }) => {
  const [formData, setFormData] = useState({
    vendor: '',
    effective_date: '',
    end_date: '',
    term_length_months: '',
    total_value: '',
    currency: 'USD'
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (agreement) {
      setFormData({
        vendor: agreement.vendor || '',
        effective_date: agreement.effective_date || '',
        end_date: agreement.end_date || '',
        term_length_months: agreement.term_length_months || '',
        total_value: agreement.total_value || '',
        currency: agreement.currency || 'USD'
      });
      setErrors({});
    }
  }, [agreement]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Vendor name is required';
    }
    
    if (!formData.effective_date) {
      newErrors.effective_date = 'Effective date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (formData.effective_date && formData.end_date) {
      const effectiveDate = new Date(formData.effective_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= effectiveDate) {
        newErrors.end_date = 'End date must be after effective date';
      }
    }
    
    if (!formData.term_length_months || formData.term_length_months < 1) {
      newErrors.term_length_months = 'Term length must be at least 1 month';
    }
    
    if (!formData.total_value || formData.total_value < 0) {
      newErrors.total_value = 'Total value must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      await onSave(agreement.id, {
        ...formData,
        term_length_months: parseInt(formData.term_length_months),
        total_value: parseFloat(formData.total_value)
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.5rem',
    border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s',
    backgroundColor: hasError ? '#fef2f2' : 'white'
  });

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      overflow: 'auto',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            Edit Agreement
          </h3>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Vendor Name */}
            <div>
              <label style={labelStyle}>Vendor Name</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => handleChange('vendor', e.target.value)}
                style={inputStyle(errors.vendor)}
                placeholder="Enter vendor name"
              />
              {errors.vendor && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.vendor}
                </p>
              )}
            </div>

            {/* Date fields in a row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Effective Date</label>
                <input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => handleChange('effective_date', e.target.value)}
                  style={inputStyle(errors.effective_date)}
                />
                {errors.effective_date && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.effective_date}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  style={inputStyle(errors.end_date)}
                />
                {errors.end_date && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.end_date}
                  </p>
                )}
              </div>
            </div>

            {/* Term and Value in a row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Term Length (months)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.term_length_months}
                  onChange={(e) => handleChange('term_length_months', e.target.value)}
                  style={inputStyle(errors.term_length_months)}
                  placeholder="12"
                />
                {errors.term_length_months && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.term_length_months}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Total Value</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_value}
                  onChange={(e) => handleChange('total_value', e.target.value)}
                  style={inputStyle(errors.total_value)}
                  placeholder="50000.00"
                />
                {errors.total_value && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.total_value}
                  </p>
                )}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label style={labelStyle}>Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                style={inputStyle(false)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: saving ? 0.5 : 1
              }}
              onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#f9fafb')}
              onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = 'white')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                backgroundColor: saving ? '#9ca3af' : '#3b82f6',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = '#3b82f6')}
            >
              <Save size={14} style={{ marginRight: '0.25rem' }} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AgreementsList = ({ agreements, highlightedAgreementId, onHighlightClear, onDeleteAgreement, onEditAgreement }) => {
  const agreementRefs = useRef({});
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, agreement: null });
  const [editDialog, setEditDialog] = useState({ isOpen: false, agreement: null });
  const [deletingId, setDeletingId] = useState(null);

  // Scroll to highlighted agreement
  useEffect(() => {
    if (highlightedAgreementId && agreementRefs.current[highlightedAgreementId]) {
      agreementRefs.current[highlightedAgreementId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        if (onHighlightClear) onHighlightClear();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [highlightedAgreementId, onHighlightClear]);

  const handleDeleteClick = (agreement, e) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, agreement });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.agreement || !onDeleteAgreement) return;

    setDeletingId(deleteDialog.agreement.id);
    setDeleteDialog({ isOpen: false, agreement: null });

    try {
      await onDeleteAgreement(deleteDialog.agreement.id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, agreement: null });
  };

  const handleEditClick = (agreement, e) => {
    e.stopPropagation();
    setEditDialog({ isOpen: true, agreement });
  };

  const handleEditSave = async (agreementId, agreementData) => {
    if (!onEditAgreement) return;
    
    try {
      await onEditAgreement(agreementId, agreementData);
      setEditDialog({ isOpen: false, agreement: null });
    } catch (error) {
      throw error; // Let the dialog handle the error
    }
  };

  const handleEditCancel = () => {
    setEditDialog({ isOpen: false, agreement: null });
  };

  if (!agreements || agreements.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <FileText size={20} />
          <h2 style={styles.cardTitle}>Agreements</h2>
        </div>
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>No agreements uploaded yet</p>
      </div>
    );
  }

  // Separate active and expired agreements
  const activeAgreements = agreements.filter(agreement => !isAgreementExpired(agreement));
  const expiredAgreements = agreements.filter(agreement => isAgreementExpired(agreement));
  const sortedAgreements = [...activeAgreements, ...expiredAgreements];

  return (
    <>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <FileText size={20} />
          <h2 style={styles.cardTitle}>
            Agreements ({activeAgreements.length} active
            {expiredAgreements.length > 0 && `, ${expiredAgreements.length} expired`})
          </h2>
        </div>
        
        <div style={styles.eventsList}>
          {sortedAgreements.map((agreement) => {
            const isHighlighted = agreement.id === highlightedAgreementId;
            const isExpired = isAgreementExpired(agreement);
            const isDeleting = deletingId === agreement.id;
            
            const cardStyle = {
              ...styles.agreementCard,
              ...(isExpired ? {
                backgroundColor: '#f9fafb',
                borderColor: '#d1d5db',
                opacity: 0.8
              } : {}),
              ...(isHighlighted ? {
                backgroundColor: isExpired ? '#f3f4f6' : '#dbeafe',
                borderColor: '#3b82f6',
                borderWidth: '2px',
                transform: 'scale(1.02)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
              } : {}),
              ...(isDeleting ? {
                opacity: 0.5,
                pointerEvents: 'none'
              } : {})
            };
            
            return (
              <div
                key={agreement.id}
                ref={el => agreementRefs.current[agreement.id] = el}
                style={cardStyle}
                onMouseEnter={(e) => {
                  if (!isHighlighted && !isExpired && !isDeleting) {
                    Object.assign(e.target.style, styles.agreementCardHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isHighlighted && !isExpired && !isDeleting) {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.borderWidth = '1px';
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={styles.eventHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{
                        ...styles.agreementVendor,
                        ...(isHighlighted ? { color: '#1e40af' } : {}),
                        ...(isExpired ? { color: '#6b7280' } : {}),
                        marginBottom: 0
                      }}>
                        {agreement.vendor}
                      </h3>
                      {isExpired && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#fef2f2',
                          borderRadius: '0.375rem',
                          border: '1px solid #fecaca'
                        }}>
                          <AlertTriangle size={12} color="#ef4444" style={{ marginRight: '0.25rem' }} />
                          <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>
                            EXPIRED
                          </span>
                        </div>
                      )}
                    </div>
                    <p style={{ 
                      color: isExpired ? '#9ca3af' : '#6b7280', 
                      fontSize: '0.875rem', 
                      marginBottom: '0.5rem' 
                    }}>
                      {agreement.filename}
                    </p>
                    
                    <div style={styles.agreementDetails}>
                      <div>
                        <span style={{ color: '#6b7280' }}>Effective:</span> {formatDate(agreement.effective_date)}
                      </div>
                      <div>
                        <span style={{ color: isExpired ? '#ef4444' : '#6b7280' }}>
                          {isExpired ? 'Expired:' : 'Expires:'}
                        </span> {formatDate(agreement.end_date)}
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Term:</span> {agreement.term_length_months} months
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Value:</span> {formatCurrency(agreement.total_value)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      Added {formatDate(agreement.created_at)}
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* Edit Button */}
                      {onEditAgreement && (
                        <button
                          onClick={(e) => handleEditClick(agreement, e)}
                          disabled={isDeleting}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: isDeleting ? '#f9fafb' : '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.375rem',
                            color: isDeleting ? '#9ca3af' : '#1e40af',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isDeleting) {
                              e.target.style.backgroundColor = '#dbeafe';
                              e.target.style.borderColor = '#3b82f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDeleting) {
                              e.target.style.backgroundColor = '#eff6ff';
                              e.target.style.borderColor = '#bfdbfe';
                            }
                          }}
                        >
                          <Edit3 size={12} style={{ marginRight: '0.25rem' }} />
                          Edit
                        </button>
                      )}

                      {/* Delete Button */}
                      {onDeleteAgreement && (
                        <button
                          onClick={(e) => handleDeleteClick(agreement, e)}
                          disabled={isDeleting}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: isDeleting ? '#f9fafb' : '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '0.375rem',
                            color: isDeleting ? '#9ca3af' : '#dc2626',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isDeleting) {
                              e.target.style.backgroundColor = '#fee2e2';
                              e.target.style.borderColor = '#ef4444';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDeleting) {
                              e.target.style.backgroundColor = '#fef2f2';
                              e.target.style.borderColor = '#fecaca';
                            }
                          }}
                        >
                          <Trash2 size={12} style={{ marginRight: '0.25rem' }} />
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        agreementVendor={deleteDialog.agreement?.vendor}
      />

      <EditDialog
        isOpen={editDialog.isOpen}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
        agreement={editDialog.agreement}
      />
    </>
  );
};

export default AgreementsList;