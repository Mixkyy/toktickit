import React, { useState, useEffect } from 'react';
import { useRequester } from '../context/RequesterContext.js';
import { Category } from '../api.js';

interface Ticket {
  id: number;
  ticketNumber: string;
  summary: string;
  currentStatus: string;
  createdAt: string;
  category: { name: string };
  relatedSystem: { name: string };
}

export const Dashboard = ({ onCreateTicket }: { onCreateTicket: () => void }) => {
  const { selectedRequester } = useRequester();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
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
        if (statusFilter) queryParams.append('status', statusFilter);
        if (categoryFilter) queryParams.append('categoryId', categoryFilter);
        if (searchTerm) queryParams.append('search', searchTerm);

        const res = await fetch(`http://localhost:3000/api/tickets?${queryParams.toString()}`, {
          headers: {
            'X-Requester-Id': selectedRequester?.id.toString() || ''
          }
        });
        
        if (!res.ok) throw new Error('Failed to fetch tickets');
        const data = await res.json();
        setTickets(data);
      } catch (err: any) {
        setError(err.message || 'API Error');
      } finally {
        setLoading(false);
      }
    };
    
    // Slight debounce for search input
    const timeoutId = setTimeout(() => {
      fetchTickets();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [statusFilter, categoryFilter, searchTerm, selectedRequester]);

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
        <div>
          <h2 style={{ color: '#006B3C' }}>My Tickets</h2>
          <p className="text-muted mb-0">View and track your IT support requests.</p>
        </div>
        <button 
          className="btn" 
          style={{ backgroundColor: '#006B3C', color: 'white' }}
          onClick={onCreateTicket}
        >
          + Create New Ticket
        </button>
      </div>
      
      <div className="card-body p-4">
        {error && <div className="alert alert-danger">{error}</div>}
        
        {/* Filters */}
        <div className="row g-3 mb-4 p-3 rounded" style={{ backgroundColor: '#F5F7F6' }}>
          <div className="col-md-4">
            <label htmlFor="statusFilter" className="form-label fw-bold text-muted small">Status</label>
            <select 
              id="statusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-4">
            <label htmlFor="categoryFilter" className="form-label fw-bold text-muted small">Category</label>
            <select 
              id="categoryFilter"
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label htmlFor="searchFilter" className="form-label fw-bold text-muted small">Search</label>
            <input 
              id="searchFilter"
              type="text" 
              className="form-control"
              placeholder="Ticket # or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Ticket #</th>
                <th>Summary</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Loading tickets...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-muted">No tickets found matching your criteria.</td></tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td><strong>{ticket.ticketNumber}</strong></td>
                    <td>{ticket.summary}</td>
                    <td>{ticket.category?.name}</td>
                    <td>
                      <span className={`badge rounded-pill ${ticket.currentStatus === 'New' ? 'bg-primary' : ticket.currentStatus === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {ticket.currentStatus}
                      </span>
                    </td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
