import React, { useState, useEffect } from 'react';
import { useRequester } from '../context/RequesterContext.js';
import { Category } from '../api.js';

interface RelatedSystem {
  id: number;
  name: string;
}

export const CreateTicket = ({ onCancel }: { onCancel: () => void }) => {
  const { selectedRequester } = useRequester();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    relatedSystemId: '',
    summary: '',
    description: '',
    requestedPriority: 'MEDIUM'
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadFailures, setUploadFailures] = useState<{name: string, error: string}[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catRes, sysRes] = await Promise.all([
          fetch('http://localhost:3000/api/categories'),
          fetch('http://localhost:3000/api/related-systems')
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (sysRes.ok) setRelatedSystems(await sysRes.json());
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setErrors({ ...errors, attachments: 'Maximum 5 attachments allowed.' });
      e.target.value = '';
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const invalidFile = files.find(f => !allowedTypes.includes(f.type));
    if (invalidFile) {
      setErrors({ ...errors, attachments: 'Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.' });
      e.target.value = '';
      return;
    }
    
    const oversizedFile = files.find(f => f.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      setErrors({ ...errors, attachments: 'File too large. Maximum size is 5MB.' });
      e.target.value = '';
      return;
    }
    
    const newErrors = { ...errors };
    delete newErrors.attachments;
    setErrors(newErrors);
    setSelectedFiles(files);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.relatedSystemId) newErrors.relatedSystemId = 'Related system is required';
    if (!formData.summary.trim()) newErrors.summary = 'Summary is required';
    if (formData.summary.length > 100) newErrors.summary = 'Summary must be 100 characters or less';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (errors.attachments) newErrors.attachments = errors.attachments; // keep file error
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setUploadFailures([]);
    try {
      const res = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requester-Id': selectedRequester?.id.toString() || ''
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to create ticket');
      const data = await res.json();
      
      const failures: {name: string, error: string}[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formDataObj = new FormData();
          formDataObj.append('attachment', file);
          
          try {
            const uploadRes = await fetch(`http://localhost:3000/api/tickets/${data.id}/attachments`, {
              method: 'POST',
              headers: {
                'X-Requester-Id': selectedRequester?.id.toString() || ''
              },
              body: formDataObj
            });
            if (!uploadRes.ok) {
              const errData = await uploadRes.json().catch(() => ({}));
              failures.push({ name: file.name, error: errData.error || 'Upload failed' });
            }
          } catch (err) {
            failures.push({ name: file.name, error: 'Network error' });
          }
        }
      }
      
      setUploadFailures(failures);
      setSubmitSuccess(true);
      setTicketNumber(data.ticketNumber);
    } catch (err) {
      setErrors({ submit: 'An error occurred while creating the ticket.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body p-5 text-center">
          <div className="display-1 text-success mb-3">✓</div>
          <h2 style={{ color: '#006B3C' }}>Ticket Created Successfully!</h2>
          <p className="text-muted">Your IT Support ticket has been created.</p>
          <div className="alert mt-4 mb-4" style={{ backgroundColor: '#EAF6EF', color: '#0B7A46', display: 'inline-block', fontSize: '1.25rem' }}>
            <strong>Ticket #: {ticketNumber}</strong>
          </div>
          
          {uploadFailures.length > 0 && (
            <div className="alert alert-warning text-start mx-auto" style={{ maxWidth: '500px' }}>
              <strong>Note:</strong> The ticket was created, but some attachments failed to upload:
              <ul className="mb-0 mt-2">
                {uploadFailures.map((f, i) => (
                  <li key={i}>{f.name}: {f.error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <button className="btn btn-outline-secondary me-2" onClick={onCancel}>Back to Home</button>
            <button className="btn" style={{ backgroundColor: '#006B3C', color: 'white' }} onClick={() => {
              setSubmitSuccess(false);
              setFormData({ ...formData, summary: '', description: '' });
              setSelectedFiles([]);
              setUploadFailures([]);
            }}>
              Create Another Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-start">
        <div>
          <h2 style={{ color: '#006B3C' }}>Create IT Support Ticket</h2>
          <p className="text-muted mb-0">Please provide details about your issue below.</p>
        </div>
        {selectedRequester && (
          <div className="text-end">
            <span className="badge" style={{ backgroundColor: '#EAF6EF', color: '#0B7A46', fontSize: '0.9rem', padding: '0.5rem 0.8rem', border: '1px solid #c3e6cb' }}>
              Requester: {selectedRequester.name}
            </span>
          </div>
        )}
      </div>
      <div className="card-body p-4">
        {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Category <span className="text-danger">*</span></label>
              <select 
                className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                required
              >
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Related System <span className="text-danger">*</span></label>
              <select 
                className={`form-select ${errors.relatedSystemId ? 'is-invalid' : ''}`}
                value={formData.relatedSystemId}
                onChange={e => setFormData({...formData, relatedSystemId: e.target.value})}
                required
              >
                <option value="">Select System...</option>
                {relatedSystems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.relatedSystemId && <div className="invalid-feedback">{errors.relatedSystemId}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Summary <span className="text-danger">*</span></label>
            <input 
              type="text" 
              className={`form-control ${errors.summary ? 'is-invalid' : ''}`}
              placeholder="Brief summary of the issue (max 100 characters)"
              value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
              maxLength={100}
              required
            />
            {errors.summary && <div className="invalid-feedback">{errors.summary}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Description <span className="text-danger">*</span></label>
            <textarea 
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows={5}
              placeholder="Detailed description of the problem, error messages, and steps to reproduce..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Requested Priority <span className="text-danger">*</span></label>
              <select 
                className="form-select"
                value={formData.requestedPriority}
                onChange={e => setFormData({...formData, requestedPriority: e.target.value})}
              >
                <option value="LOW">Low - Not urgent, minor issue</option>
                <option value="MEDIUM">Medium - Normal issue, affects work</option>
                <option value="HIGH">High - Urgent, cannot work</option>
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label fw-bold">Attachments</label>
              <input 
                type="file" 
                className={`form-control ${errors.attachments ? 'is-invalid' : ''}`}
                multiple 
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
              />
              <div className="form-text">Max 5 files. Max size 5MB each. Supported formats: JPG, PNG, WEBP, PDF.</div>
              {errors.attachments && <div className="invalid-feedback">{errors.attachments}</div>}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn" style={{ backgroundColor: '#006B3C', color: 'white' }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
