import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invalid credentials');
      }

      const data = await res.json();
      login(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-header bg-white border-0 text-center pt-4">
          <h2 style={{ color: '#006B3C' }} className="fw-bold">TokTickIT</h2>
          <p className="text-muted mb-0">Sign in to your account</p>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Email address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-success w-100 mb-3" 
              style={{ backgroundColor: '#006B3C' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="text-center">
              <button 
                type="button" 
                className="btn btn-link text-success text-decoration-none small"
                onClick={() => alert("Please contact your IT Administrator to reset your password.")}
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
