import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
export function ChangePassword() {
    const { updateUser, user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "container py-5 d-flex justify-content-center align-items-center", style: { minHeight: '100vh' }, children: _jsxs("div", { className: "card shadow border-0", style: { maxWidth: '450px', width: '100%' }, children: [_jsxs("div", { className: "card-header bg-white border-0 text-center pt-4", children: [_jsx("h3", { style: { color: '#006B3C' }, className: "fw-bold", children: "Change Your Password" }), _jsx("p", { className: "text-muted mb-0", children: "You must change your password to continue." })] }), _jsxs("div", { className: "card-body p-4", children: [error && _jsx("div", { className: "alert alert-danger py-2", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label text-muted small fw-bold", children: "Current (temporary) password" }), _jsx("input", { type: "password", className: "form-control", value: currentPassword, onChange: e => setCurrentPassword(e.target.value), required: true })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label text-muted small fw-bold", children: "New password" }), _jsx("input", { type: "password", className: "form-control", value: newPassword, onChange: e => setNewPassword(e.target.value), required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "form-label text-muted small fw-bold", children: "Confirm new password" }), _jsx("input", { type: "password", className: "form-control", value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), required: true })] }), _jsxs("div", { className: "bg-light p-3 rounded mb-4", children: [_jsx("div", { className: "small text-muted fw-bold mb-2", children: "Password must:" }), _jsxs("ul", { className: "small text-muted mb-0 ps-3", children: [_jsx("li", { children: "Be at least 8 characters" }), _jsx("li", { children: "Include upper and lower case letters" }), _jsx("li", { children: "Include a number and a special character" })] })] }), _jsx("button", { type: "submit", className: "btn btn-success w-100", style: { backgroundColor: '#006B3C' }, disabled: loading, children: loading ? 'Updating...' : 'Continue' })] })] })] }) }));
}
