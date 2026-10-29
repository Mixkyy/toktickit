import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';

interface TicketSummary {
  id: number;
  ticketNumber: string;
  summary: string;
  currentStatus: string;
  requestedPriority: string;
  updatedAt: string;
  createdAt: string;
  requester?: { id: number; name: string; email: string };
  owner?: { id: number; name: string; email: string };
  category?: { id: number; name: string };
  relatedSystem?: { id: number; name: string };
}

interface StaffMetrics {
  new: number;
  open: number;
  inProgress: number;
  waitingForRequester: number;
  myAssigned: number;
  userCount?: number;
}

interface StaffDashboardProps {
  onCreateTicket: () => void;
  onViewTicket: (id: number) => void;
  onNavigateQueue: (filter?: string) => void;
  onNavigateAdmin?: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onCreateTicket,
  onViewTicket,
  onNavigateQueue,
  onNavigateAdmin,
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<StaffMetrics>({
    new: 0,
    open: 0,
    inProgress: 0,
    waitingForRequester: 0,
    myAssigned: 0,
  });
  const [recentTickets, setRecentTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/dashboards/staff', {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to load staff dashboard');
        }

        const data = await res.json();
        setMetrics(
          data.metrics || {
            new: 0,
            open: 0,
            inProgress: 0,
            waitingForRequester: 0,
            myAssigned: 0,
          }
        );
        setRecentTickets(data.recentTickets || []);
      } catch (err: any) {
        console.error('Staff dashboard error:', err);
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
        return 'badge bg-danger';
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

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'badge bg-danger';
      case 'HIGH':
        return 'badge bg-warning text-dark';
      case 'MEDIUM':
        return 'badge bg-info text-dark';
      case 'LOW':
        return 'badge bg-secondary';
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
        <p className="mt-2 text-muted">Loading IT Service Desk metrics...</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMINISTRATOR';

  return (
    <div className="staff-dashboard">
      {/* Header & Quick Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="h4 mb-1" style={{ color: '#006B3C', fontWeight: 700 }}>
            {isAdmin ? 'Administrator Dashboard' : 'IT Staff Dashboard'}
          </h2>
          <p className="text-muted small mb-0">
            System queue status, priority allocation, and assigned workload.
          </p>
        </div>
        <div className="d-flex gap-2">
          {isAdmin && onNavigateAdmin && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={onNavigateAdmin}
              id="btn-nav-admin-dashboard"
            >
              User Management
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onNavigateQueue()}
            id="btn-nav-queue-dashboard"
          >
            My Queue
          </button>
          <button
            className="btn btn-sm text-white"
            style={{ backgroundColor: '#006B3C', borderColor: '#006B3C' }}
            onClick={onCreateTicket}
            id="btn-create-ticket-staff"
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
      <div className="row g-3 mb-4" id="staff-metrics-grid">
        {/* New Tickets */}
        <div className="col-12 col-sm-6 col-lg-2">
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#FFEAEA',
              borderLeft: '4px solid #DC3545',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onNavigateQueue('New')}
            role="button"
            tabIndex={0}
            id="metric-card-new"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">New</div>
            <div className="h2 fw-bold text-danger mb-0">{metrics.new}</div>
            <div className="small text-muted mt-1">Unassigned</div>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="col-12 col-sm-6 col-lg-2">
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#EAF6EF',
              borderLeft: '4px solid #006B3C',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onNavigateQueue('Open')}
            role="button"
            tabIndex={0}
            id="metric-card-open"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">Open</div>
            <div className="h2 fw-bold" style={{ color: '#006B3C' }}>
              {metrics.open}
            </div>
            <div className="small text-muted mt-1">Ready for work</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="col-12 col-sm-6 col-lg-2">
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#FFF9E6',
              borderLeft: '4px solid #FFC107',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onNavigateQueue('In Progress')}
            role="button"
            tabIndex={0}
            id="metric-card-inprogress"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">In Progress</div>
            <div className="h2 fw-bold text-warning mb-0">{metrics.inProgress}</div>
            <div className="small text-muted mt-1">Active handling</div>
          </div>
        </div>

        {/* Waiting for Requester */}
        <div className="col-12 col-sm-6 col-lg-2">
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#E8F4FD',
              borderLeft: '4px solid #0D6EFD',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onNavigateQueue('Waiting for Requester')}
            role="button"
            tabIndex={0}
            id="metric-card-waiting"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">Waiting</div>
            <div className="h2 fw-bold text-primary mb-0">{metrics.waitingForRequester}</div>
            <div className="small text-muted mt-1">Pending user reply</div>
          </div>
        </div>

        {/* My Assigned */}
        <div className={`col-12 col-sm-6 ${isAdmin ? 'col-lg-2' : 'col-lg-4'}`}>
          <div
            className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
            style={{
              backgroundColor: '#EAF6EF',
              borderLeft: '4px solid #0B7A46',
              cursor: 'pointer',
              transition: 'transform 0.15s ease-in-out',
            }}
            onClick={() => onNavigateQueue('My Assigned')}
            role="button"
            tabIndex={0}
            id="metric-card-assigned"
          >
            <div className="text-muted small text-uppercase fw-bold mb-1">My Assigned</div>
            <div className="h2 fw-bold" style={{ color: '#0B7A46' }}>
              {metrics.myAssigned}
            </div>
            <div className="small text-muted mt-1">Assigned to me</div>
          </div>
        </div>

        {/* Admin Total Users */}
        {isAdmin && metrics.userCount !== undefined && (
          <div className="col-12 col-sm-6 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100 cursor-pointer text-center p-3"
              style={{
                backgroundColor: '#F3E8FD',
                borderLeft: '4px solid #6F42C1',
                cursor: 'pointer',
                transition: 'transform 0.15s ease-in-out',
              }}
              onClick={onNavigateAdmin}
              role="button"
              tabIndex={0}
              id="metric-card-users"
            >
              <div className="text-muted small text-uppercase fw-bold mb-1">Total Users</div>
              <div className="h2 fw-bold text-dark mb-0">{metrics.userCount}</div>
              <div className="small text-muted mt-1">System accounts</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
          <h5 className="mb-0 fw-bold" style={{ color: '#006B3C' }}>
            Recent Tickets
          </h5>
          <button
            className="btn btn-sm btn-link text-decoration-none"
            style={{ color: '#006B3C' }}
            onClick={() => onNavigateQueue()}
          >
            Go to Full Queue →
          </button>
        </div>
        <div className="card-body p-0">
          {recentTickets.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-0">No active tickets found in the service desk.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: '15%' }}>Ticket #</th>
                    <th scope="col" style={{ width: '35%' }}>Summary</th>
                    <th scope="col" style={{ width: '15%' }}>Requester</th>
                    <th scope="col" style={{ width: '12%' }}>Priority</th>
                    <th scope="col" style={{ width: '13%' }}>Status</th>
                    <th scope="col" style={{ width: '10%' }} className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t) => (
                    <tr key={t.id} id={`staff-recent-ticket-${t.id}`}>
                      <td>
                        <span className="fw-semibold text-monospace">{t.ticketNumber}</span>
                      </td>
                      <td>
                        <div className="fw-medium text-dark">{t.summary}</div>
                        <small className="text-muted">{t.category?.name || 'General'}</small>
                      </td>
                      <td>
                        <span className="small text-muted">{t.requester?.name || 'Unknown'}</span>
                      </td>
                      <td>
                        <span className={getPriorityBadgeClass(t.requestedPriority)}>
                          {t.requestedPriority}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(t.currentStatus)}>{t.currentStatus}</span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onViewTicket(t.id)}
                          id={`btn-manage-ticket-${t.id}`}
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
