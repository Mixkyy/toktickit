import React, { useEffect, useState } from 'react';
import { useRequester, Requester } from '../context/RequesterContext.js';

export const RequesterSelection = ({ onContinue }: { onContinue: () => void }) => {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { selectedRequester, setSelectedRequester } = useRequester();

  useEffect(() => {
    const fetchRequesters = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/requesters');
        if (!res.ok) throw new Error('Failed to load requesters');
        const data = await res.json();
        setRequesters(data);
        if (data.length > 0 && !selectedRequester) {
          setSelectedRequester(data[0]);
        }
      } catch (err: any) {
        setError(err.message || 'API failure');
      } finally {
        setLoading(false);
      }
    };
    fetchRequesters();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const req = requesters.find((r) => r.id === parseInt(e.target.value));
    if (req) setSelectedRequester(req);
  };

  if (loading) return <div className="p-4 text-center">Loading requesters...</div>;
  if (error) return <div className="p-4 text-center text-danger border border-danger">Error: {error}</div>;
  if (requesters.length === 0) return <div className="p-4 text-center">No active requesters found.</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <div className="card shadow-sm border-0" style={{ backgroundColor: '#F5F7F6' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 style={{ color: '#006B3C' }}>Select Development Requester</h2>
            <p className="text-muted">
              Choose a development requester to simulate the current requester context for Lab 2.
              This is for testing only and is not a login screen.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: 600 }}>Development Requester <span className="text-danger">*</span></label>
            <select 
              className="form-select" 
              value={selectedRequester?.id || ''} 
              onChange={handleChange}
              aria-label="Development Requester"
            >
              {requesters.map((req) => (
                <option key={req.id} value={req.id}>{req.name}</option>
              ))}
            </select>
          </div>
          
          <div className="alert d-flex align-items-center mb-4" style={{ backgroundColor: '#EAF6EF', color: '#0B7A46' }}>
            <span className="me-2">ℹ️</span>
            <div>Only active development requesters are shown.</div>
          </div>

          <div className="alert border bg-white text-muted mb-4 d-flex align-items-center">
             <span className="me-3 fs-4">🛡️</span>
             <div>
               <strong>Authentication coming in Lab 3</strong><br/>
               <small>In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account.</small>
             </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary">Cancel</button>
            <button className="btn" style={{ backgroundColor: '#006B3C', color: 'white' }} onClick={onContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
