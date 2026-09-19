import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';

export function ChangePassword() {
  const { updateUser, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return setError('Password must meet all the security requirements listed below.');
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to change password');
      }

      // Update local context so we can enter the app
      if (user) {
        updateUser({ ...user, requiresPasswordChange: false });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-header bg-white border-0 text-center pt-4">
          <h3 style={{ color: '#006B3C' }} className="fw-bold">Change Your Password</h3>
          <p className="text-muted mb-0">You must change your password to continue.</p>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Current (temporary) password</label>
              <input 
                type="password" 
                className="form-control" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">New password</label>
              <input 
                type="password" 
                className="form-control" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required 
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Confirm new password</label>
              <input 
                type="password" 
                className="form-control" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
            <div className="bg-light p-3 rounded mb-4">
              <div className="small text-muted fw-bold mb-2">Password must:</div>
              <ul className="small text-muted mb-0 ps-3">
                <li>Be at least 8 characters</li>
                <li>Include upper and lower case letters</li>
                <li>Include a number and a special character</li>
              </ul>
            </div>
            <button 
              type="submit" 
              className="btn btn-success w-100" 
              style={{ backgroundColor: '#006B3C' }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
