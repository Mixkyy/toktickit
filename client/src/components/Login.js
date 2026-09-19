import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
export function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "container py-5 d-flex justify-content-center align-items-center", style: { minHeight: '100vh' }, children: _jsxs("div", { className: "card shadow border-0", style: { maxWidth: '400px', width: '100%' }, children: [_jsxs("div", { className: "card-header bg-white border-0 text-center pt-4", children: [_jsx("h2", { style: { color: '#006B3C' }, className: "fw-bold", children: "TokTickIT" }), _jsx("p", { className: "text-muted mb-0", children: "Sign in to your account" })] }), _jsxs("div", { className: "card-body p-4", children: [error && _jsx("div", { className: "alert alert-danger py-2", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label text-muted small fw-bold", children: "Email address" }), _jsx("input", { type: "email", className: "form-control", value: email, onChange: e => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "form-label text-muted small fw-bold", children: "Password" }), _jsx("input", { type: "password", className: "form-control", value: password, onChange: e => setPassword(e.target.value), required: true })] }), _jsx("button", { type: "submit", className: "btn btn-success w-100 mb-3", style: { backgroundColor: '#006B3C' }, disabled: loading, children: loading ? 'Signing in...' : 'Sign In' }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", className: "btn btn-link text-success text-decoration-none small", onClick: () => alert("Please contact your IT Administrator to reset your password."), children: "Forgot your password?" }) })] })] })] }) }));
}
