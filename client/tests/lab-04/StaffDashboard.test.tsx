import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StaffDashboard } from '../../src/components/StaffDashboard';

let mockUser = { id: 2, name: 'Bob Staff', role: 'IT_STAFF' };

vi.mock('../../src/context/AuthContext.js', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

describe('StaffDashboard Component (Lab 4 / Issue #51 / UI-02 / FR-07)', () => {
  const mockStaffData = {
    metrics: {
      new: 14,
      open: 23,
      inProgress: 18,
      waitingForRequester: 7,
      myAssigned: 6,
    },
    recentTickets: [
      {
        id: 201,
        ticketNumber: 'TKT-2026-201',
        summary: 'VPN Authentication Failure',
        requestedPriority: 'HIGH',
        currentStatus: 'New',
        category: { id: 1, name: 'Network' },
        requester: { id: 5, name: 'Carol Student', email: 'carol@kmutt.ac.th' },
        updatedAt: '2026-10-29T11:00:00.000Z',
        createdAt: '2026-10-29T10:00:00.000Z',
      },
      {
        id: 202,
        ticketNumber: 'TKT-2026-202',
        summary: 'Classroom Projector bulb replacement',
        requestedPriority: 'CRITICAL',
        currentStatus: 'In Progress',
        category: { id: 2, name: 'Hardware' },
        requester: { id: 6, name: 'Dave Professor', email: 'dave@kmutt.ac.th' },
        updatedAt: '2026-10-29T12:00:00.000Z',
        createdAt: '2026-10-29T10:30:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    mockUser = { id: 2, name: 'Bob Staff', role: 'IT_STAFF' };
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/dashboards/staff')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStaffData),
        } as Response);
      }
      return Promise.reject(new Error(`Unhandled URL: ${urlStr}`));
    });
  });

  it('UI-02 (FR-07): Renders staff metric cards with accurate values and labels', async () => {
    render(
      <StaffDashboard
        onCreateTicket={vi.fn()}
        onViewTicket={vi.fn()}
        onNavigateQueue={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('IT Staff Dashboard')).toBeInTheDocument();
    });

    const newCard = document.getElementById('metric-card-new')!;
    expect(newCard).toBeInTheDocument();
    expect(within(newCard).getByText('New')).toBeInTheDocument();
    expect(within(newCard).getByText('14')).toBeInTheDocument();

    const openCard = document.getElementById('metric-card-open')!;
    expect(openCard).toBeInTheDocument();
    expect(within(openCard).getByText('Open')).toBeInTheDocument();
    expect(within(openCard).getByText('23')).toBeInTheDocument();

    const inProgressCard = document.getElementById('metric-card-inprogress')!;
    expect(inProgressCard).toBeInTheDocument();
    expect(within(inProgressCard).getByText('In Progress')).toBeInTheDocument();
    expect(within(inProgressCard).getByText('18')).toBeInTheDocument();

    const waitingCard = document.getElementById('metric-card-waiting')!;
    expect(waitingCard).toBeInTheDocument();
    expect(within(waitingCard).getByText('Waiting')).toBeInTheDocument();
    expect(within(waitingCard).getByText('7')).toBeInTheDocument();

    const assignedCard = document.getElementById('metric-card-assigned')!;
    expect(assignedCard).toBeInTheDocument();
    expect(within(assignedCard).getByText('My Assigned')).toBeInTheDocument();
    expect(within(assignedCard).getByText('6')).toBeInTheDocument();
  });

  it('UI-02 (FR-07): Displays recent tickets table with summary, requester, priority, and status', async () => {
    render(
      <StaffDashboard
        onCreateTicket={vi.fn()}
        onViewTicket={vi.fn()}
        onNavigateQueue={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('TKT-2026-201')).toBeInTheDocument();
    });

    expect(screen.getByText('VPN Authentication Failure')).toBeInTheDocument();
    expect(screen.getByText('Carol Student')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();

    expect(screen.getByText('TKT-2026-202')).toBeInTheDocument();
    expect(screen.getByText('Classroom Projector bulb replacement')).toBeInTheDocument();
    expect(screen.getByText('Dave Professor')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('Calls onNavigateQueue with status when clicking metric card', async () => {
    const handleNavigateQueue = vi.fn();
    render(
      <StaffDashboard
        onCreateTicket={vi.fn()}
        onViewTicket={vi.fn()}
        onNavigateQueue={handleNavigateQueue}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('IT Staff Dashboard')).toBeInTheDocument();
    });

    const assignedCard = document.getElementById('metric-card-assigned');
    expect(assignedCard).toBeInTheDocument();
    fireEvent.click(assignedCard!);

    expect(handleNavigateQueue).toHaveBeenCalledWith('My Assigned');
  });

  it('Renders userCount metric and User Management button when user is ADMINISTRATOR', async () => {
    mockUser = { id: 3, name: 'Admin Alice', role: 'ADMINISTRATOR' };
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: any) => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockStaffData,
            metrics: { ...mockStaffData.metrics, userCount: 42 },
          }),
      } as Response);
    });

    const handleNavigateAdmin = vi.fn();
    render(
      <StaffDashboard
        onCreateTicket={vi.fn()}
        onViewTicket={vi.fn()}
        onNavigateQueue={vi.fn()}
        onNavigateAdmin={handleNavigateAdmin}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Administrator Dashboard')).toBeInTheDocument();
    });

    const usersCard = document.getElementById('metric-card-users')!;
    expect(usersCard).toBeInTheDocument();
    expect(within(usersCard).getByText('Total Users')).toBeInTheDocument();
    expect(within(usersCard).getByText('42')).toBeInTheDocument();

    const adminBtn = document.getElementById('btn-nav-admin-dashboard');
    expect(adminBtn).toBeInTheDocument();
    fireEvent.click(adminBtn!);
    expect(handleNavigateAdmin).toHaveBeenCalledTimes(1);
  });
});
