import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';

interface TicketSummary {
  id: number;
  ticketNumber: string;
  summary: string;
  currentStatus: string;
  updatedAt: string;
  createdAt: string;
  category?: { id: number; name: string };
  relatedSystem?: { id: number; name: string };
}

interface RequesterMetrics {
  openTickets: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

interface RequesterDashboardProps {
  onCreateTicket: () => void;
  onViewTicket: (id: number) => void;
  onViewAllTickets: (statusFilter?: string) => void;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  onCreateTicket,
  onViewTicket,
  onViewAllTickets,
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RequesterMetrics>({
    openTickets: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [recentTickets, setRecentTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const headers: Record<string, string> = {};
        if (user?.id) {
          headers['X-Requester-Id'] = user.id.toString();
        }

        const res = await fetch('/api/dashboards/requester', {
          headers,
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to load requester dashboard');
        }

        const data = await res.json();
        setMetrics(data.metrics || { openTickets: 0, inProgress: 0, resolved: 0, closed: 0 });
        setRecentTickets(data.recentTickets || []);
      } catch (err: any) {
        console.error('Requester dashboard error:', err);
        setError(err.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.id]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New':
      case 'Open':
        return 'badge bg-primary';
      case 'In Progress':
        return 'badge bg-warning text-dark';
      case 'Waiting for Requester':
        return 'badge bg-info text-dark';
      case 'Resolved':
        return 'badge bg-success';
      case 'Closed':
        return 'badge bg-secondary';
      case 'Cancelled':
        return 'badge bg-dark';
      default:
        return 'badge bg-light text-dark border';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
        <p className="mt-2 text-muted">Loading your service desk overview...</p>
      </div>
    );
  }

  return (
    <div className="requester-dashboard">
      {/* Header & Quick Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="h4 mb-1" style={{ color: '#006B3C', fontWeight: 700 }}>
            Requester Dashboard
          </h2>
          <p className="text-muted small mb-0">Overview of your submitted support requests and status updates.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onViewAllTickets()}
            id="btn-view-all-tickets"
          >
            View My Tickets
          </button>
          <button
            className="btn btn-sm text-white"
            style={{ backgroundColor: '#006B3C', borderColor: '#006B3C' }}
            onClick={onCreateTicket}
            id="btn-create-ticket-dashboard"
          >
            + Create Ticket
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="row g-3 mb-4" id="requester-metrics-grid">
        {/* Open Tickets */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#EAF6EF',
              borderLeft: '4px solid #006B3C',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onViewAllTickets('Open')}
            role="button"
            tabIndex={0}
            id="metric-card-open"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">My Open Tickets</div>
            <div className="display-6 fw-bold" style={{ color: '#006B3C' }}>
              {metrics.openTickets}
            </div>
            <div className="small text-muted mt-1">Open / New requests</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#FFF9E6',
              borderLeft: '4px solid #FFC107',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onViewAllTickets('In Progress')}
            role="button"
            tabIndex={0}
            id="metric-card-inprogress"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">In Progress</div>
            <div className="display-6 fw-bold text-warning">
              {metrics.inProgress}
            </div>
            <div className="small text-muted mt-1">Currently being handled</div>
          </div>
        </div>

        {/* Resolved */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#EAF6EF',
              borderLeft: '4px solid #0B7A46',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onViewAllTickets('Resolved')}
            role="button"
            tabIndex={0}
            id="metric-card-resolved"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">Resolved</div>
            <div className="display-6 fw-bold" style={{ color: '#0B7A46' }}>
              {metrics.resolved}
            </div>
            <div className="small text-muted mt-1">Pending your confirmation</div>
          </div>
        </div>

        {/* Closed */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#F8F9FA',
              borderLeft: '4px solid #6C757D',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onViewAllTickets('Closed')}
            role="button"
            tabIndex={0}
            id="metric-card-closed"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">Closed</div>
            <div className="display-6 fw-bold text-secondary">
              {metrics.closed}
            </div>
            <div className="small text-muted mt-1">Completed tickets</div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 fw-bold" style={{ color: '#006B3C' }}>
            My Recent Tickets
          </h5>
          <button
            className="btn btn-sm btn-link text-decoration-none"
            style={{ color: '#006B3C' }}
            onClick={() => onViewAllTickets()}
          >
            View All ({recentTickets.length}) →
          </button>
        </div>
        <div className="card-body p-0">
          {recentTickets.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-2">You haven't submitted any tickets yet.</p>
              <button
                className="btn btn-sm text-white"
                style={{ backgroundColor: '#006B3C' }}
                onClick={onCreateTicket}
              >
                Submit Your First Ticket
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: '15%' }}>Ticket #</th>
                    <th scope="col" style={{ width: '40%' }}>Summary</th>
                    <th scope="col" style={{ width: '15%' }}>Category</th>
                    <th scope="col" style={{ width: '15%' }}>Status</th>
                    <th scope="col" style={{ width: '15%' }} className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t) => (
                    <tr key={t.id} id={`recent-ticket-row-${t.id}`}>
                      <td>
                        <span className="fw-semibold text-monospace">{t.ticketNumber}</span>
                      </td>
                      <td>
                        <span className="text-dark fw-medium">{t.summary}</span>
                      </td>
                      <td>
                        <span className="text-muted small">{t.category?.name || 'General'}</span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(t.currentStatus)}>{t.currentStatus}</span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onViewTicket(t.id)}
                          id={`btn-view-ticket-${t.id}`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
