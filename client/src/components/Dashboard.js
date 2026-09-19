import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
export const Dashboard = ({ onCreateTicket, onViewTicket }) => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Sorting and Pagination State
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    useEffect(() => {
        // Fetch categories for the filter dropdown
        fetch('/api/categories')
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
                const res = await fetch(`/api/tickets?${queryParams.toString()}`, {
                    headers: {
                        'X-Requester-Id': user?.id.toString() || ''
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
    }, [statusFilter, categoryFilter, searchTerm, user]);
    // Derived state for sorting and pagination
    const sortedTickets = [...tickets].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === 'category')
            aVal = a.category?.name || '';
        if (sortField === 'category')
            bVal = b.category?.name || '';
        if (aVal < bVal)
            return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    const totalPages = Math.max(1, Math.ceil(sortedTickets.length / itemsPerPage));
    const currentTickets = sortedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1); // Reset to first page on sort
    };
    return (_jsxs("div", { className: "card shadow-sm border-0 mt-4", children: [_jsxs("div", { className: "card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsx("h2", { style: { color: '#006B3C' }, children: "My Tickets" }), _jsx("p", { className: "text-muted mb-0", children: "View and track your IT support requests." })] }), _jsx("button", { className: "btn", style: { backgroundColor: '#006B3C', color: 'white' }, onClick: onCreateTicket, children: "+ Create New Ticket" })] }), _jsxs("div", { className: "card-body p-4", children: [error && _jsx("div", { className: "alert alert-danger", children: error }), _jsxs("div", { className: "row g-3 mb-4 p-3 rounded", style: { backgroundColor: '#F5F7F6' }, children: [_jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "statusFilter", className: "form-label fw-bold text-muted small", children: "Status" }), _jsxs("select", { id: "statusFilter", className: "form-select", value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "New", children: "New" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Resolved", children: "Resolved" })] })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "categoryFilter", className: "form-label fw-bold text-muted small", children: "Category" }), _jsxs("select", { id: "categoryFilter", className: "form-select", value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), children: [_jsx("option", { value: "", children: "All Categories" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { htmlFor: "searchFilter", className: "form-label fw-bold text-muted small", children: "Search" }), _jsx("input", { id: "searchFilter", type: "text", className: "form-control", placeholder: "Ticket # or keywords...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] })] }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('ticketNumber'), children: ["Ticket # ", sortField === 'ticketNumber' && (sortOrder === 'asc' ? '▲' : '▼')] }), _jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('summary'), children: ["Summary ", sortField === 'summary' && (sortOrder === 'asc' ? '▲' : '▼')] }), _jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('category'), children: ["Category ", sortField === 'category' && (sortOrder === 'asc' ? '▲' : '▼')] }), _jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('currentStatus'), children: ["Status ", sortField === 'currentStatus' && (sortOrder === 'asc' ? '▲' : '▼')] }), _jsxs("th", { style: { cursor: 'pointer' }, onClick: () => handleSort('createdAt'), children: ["Date Created ", sortField === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')] }), _jsx("th", { children: "Action" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4", children: "Loading tickets..." }) })) : tickets.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-muted", children: "No tickets found matching your criteria." }) })) : (currentTickets.map(ticket => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("strong", { children: ticket.ticketNumber }) }), _jsx("td", { children: ticket.summary }), _jsx("td", { children: ticket.category?.name }), _jsx("td", { children: _jsx("span", { className: `badge rounded-pill ${ticket.currentStatus === 'New' ? 'bg-primary' : ticket.currentStatus === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`, children: ticket.currentStatus }) }), _jsx("td", { children: new Date(ticket.createdAt).toLocaleDateString() }), _jsx("td", { children: _jsx("button", { className: "btn btn-sm btn-outline-secondary", onClick: () => onViewTicket(ticket.id), children: "View" }) })] }, ticket.id)))) })] }) }), !loading && tickets.length > 0 && (_jsxs("div", { className: "d-flex justify-content-between align-items-center mt-3", children: [_jsxs("div", { className: "text-muted small", children: ["Showing ", ((currentPage - 1) * itemsPerPage) + 1, " to ", Math.min(currentPage * itemsPerPage, tickets.length), " of ", tickets.length, " tickets"] }), _jsx("nav", { children: _jsxs("ul", { className: "pagination pagination-sm mb-0", children: [_jsx("li", { className: `page-item ${currentPage === 1 ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => setCurrentPage(p => Math.max(1, p - 1)), children: "< Previous" }) }), [...Array(totalPages)].map((_, i) => (_jsx("li", { className: `page-item ${currentPage === i + 1 ? 'active' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => setCurrentPage(i + 1), children: i + 1 }) }, i))), _jsx("li", { className: `page-item ${currentPage === totalPages ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => setCurrentPage(p => Math.min(totalPages, p + 1)), children: "Next >" }) })] }) })] }))] })] }));
};
