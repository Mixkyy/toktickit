import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRequester } from '../context/RequesterContext.js';
export const Dashboard = ({ onCreateTicket }) => {
    const { selectedRequester } = useRequester();
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        // Fetch categories for the filter dropdown
        fetch('http://localhost:3000/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to load categories', err));
    }, []);
    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (statusFilter)
                    queryParams.append('status', statusFilter);
                if (categoryFilter)
                    queryParams.append('categoryId', categoryFilter);
                if (searchTerm)
                    queryParams.append('search', searchTerm);
                const res = await fetch(`http://localhost:3000/api/tickets?${queryParams.toString()}`, {
                    headers: {
                        'X-Requester-Id': selectedRequester?.id.toString() || ''
                    }
                });
                if (!res.ok)
                    throw new Error('Failed to fetch tickets');
                const data = await res.json();
                setTickets(data);
            }
            catch (err) {
                setError(err.message || 'API Error');
            }
            finally {
                setLoading(false);
            }
        };
        // Slight debounce for search input
        const timeoutId = setTimeout(() => {
            fetchTickets();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [statusFilter, categoryFilter, searchTerm, selectedRequester]);
    return (_jsxs("div", { className: "card shadow-sm border-0 mt-4", children: [_jsxs("div", { className: "card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsx("h2", { style: { color: '#006B3C' }, children: "My Tickets" }), _jsx("p", { className: "text-muted mb-0", children: "View and track your IT support requests." })] }), _jsx("button", { className: "btn", style: { backgroundColor: '#006B3C', color: 'white' }, onClick: onCreateTicket, children: "+ Create New Ticket" })] }), _jsxs("div", { className: "card-body p-4", children: [error && _jsx("div", { className: "alert alert-danger", children: error }), _jsxs("div", { className: "row g-3 mb-4 p-3 rounded", style: { backgroundColor: '#F5F7F6' }, children: [_jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "statusFilter", className: "form-label fw-bold text-muted small", children: "Status" }), _jsxs("select", { id: "statusFilter", className: "form-select", value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "New", children: "New" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Resolved", children: "Resolved" })] })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "categoryFilter", className: "form-label fw-bold text-muted small", children: "Category" }), _jsxs("select", { id: "categoryFilter", className: "form-select", value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), children: [_jsx("option", { value: "", children: "All Categories" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "searchFilter", className: "form-label fw-bold text-muted small", children: "Search" }), _jsx("input", { id: "searchFilter", type: "text", className: "form-control", placeholder: "Ticket # or keywords...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] })] }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Ticket #" }), _jsx("th", { children: "Summary" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Date Created" }), _jsx("th", { children: "Action" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4", children: "Loading tickets..." }) })) : tickets.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-muted", children: "No tickets found matching your criteria." }) })) : (tickets.map(ticket => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("strong", { children: ticket.ticketNumber }) }), _jsx("td", { children: ticket.summary }), _jsx("td", { children: ticket.category?.name }), _jsx("td", { children: _jsx("span", { className: `badge rounded-pill ${ticket.currentStatus === 'New' ? 'bg-primary' : ticket.currentStatus === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`, children: ticket.currentStatus }) }), _jsx("td", { children: new Date(ticket.createdAt).toLocaleDateString() }), _jsx("td", { children: _jsx("button", { className: "btn btn-sm btn-outline-secondary", children: "View" }) })] }, ticket.id)))) })] }) })] })] }));
};
