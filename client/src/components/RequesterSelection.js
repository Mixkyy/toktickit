import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useRequester } from '../context/RequesterContext.js';
export const RequesterSelection = ({ onContinue }) => {
    const [requesters, setRequesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { selectedRequester, setSelectedRequester } = useRequester();
    useEffect(() => {
        const fetchRequesters = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/requesters');
                if (!res.ok)
                    throw new Error('Failed to load requesters');
                const data = await res.json();
                setRequesters(data);
                if (data.length > 0 && !selectedRequester) {
                    setSelectedRequester(data[0]);
                }
            }
            catch (err) {
                setError(err.message || 'API failure');
            }
            finally {
                setLoading(false);
            }
        };
        fetchRequesters();
    }, []);
    const handleChange = (e) => {
        const req = requesters.find((r) => r.id === parseInt(e.target.value));
        if (req)
            setSelectedRequester(req);
    };
    if (loading)
        return _jsx("div", { className: "p-4 text-center", children: "Loading requesters..." });
    if (error)
        return _jsxs("div", { className: "p-4 text-center text-danger border border-danger", children: ["Error: ", error] });
    if (requesters.length === 0)
        return _jsx("div", { className: "p-4 text-center", children: "No active requesters found." });
    return (_jsx("div", { className: "container py-5", style: { maxWidth: 640 }, children: _jsx("div", { className: "card shadow-sm border-0", style: { backgroundColor: '#F5F7F6' }, children: _jsxs("div", { className: "card-body p-5", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx("h2", { style: { color: '#006B3C' }, children: "Select Development Requester" }), _jsx("p", { className: "text-muted", children: "Choose a development requester to simulate the current requester context for Lab 2. This is for testing only and is not a login screen." })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "form-label", style: { fontWeight: 600 }, children: ["Development Requester ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("select", { className: "form-select", value: selectedRequester?.id || '', onChange: handleChange, "aria-label": "Development Requester", children: requesters.map((req) => (_jsx("option", { value: req.id, children: req.name }, req.id))) })] }), _jsxs("div", { className: "alert d-flex align-items-center mb-4", style: { backgroundColor: '#EAF6EF', color: '#0B7A46' }, children: [_jsx("span", { className: "me-2", children: "\u2139\uFE0F" }), _jsx("div", { children: "Only active development requesters are shown." })] }), _jsxs("div", { className: "alert border bg-white text-muted mb-4 d-flex align-items-center", children: [_jsx("span", { className: "me-3 fs-4", children: "\uD83D\uDEE1\uFE0F" }), _jsxs("div", { children: [_jsx("strong", { children: "Authentication coming in Lab 3" }), _jsx("br", {}), _jsx("small", { children: "In Lab 3, this selection will be replaced with secure authentication so you can access the system with your own account." })] })] }), _jsxs("div", { className: "d-flex justify-content-end gap-2", children: [_jsx("button", { className: "btn btn-outline-secondary", children: "Cancel" }), _jsx("button", { className: "btn", style: { backgroundColor: '#006B3C', color: 'white' }, onClick: onContinue, children: "Continue" })] })] }) }) }));
};
