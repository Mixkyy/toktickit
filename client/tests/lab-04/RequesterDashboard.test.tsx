import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RequesterDashboard } from '../../src/components/RequesterDashboard';

const mockUser = { id: 1, name: 'Alice Requester', role: 'REQUESTER' };

vi.mock('../../src/context/AuthContext.js', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

describe('RequesterDashboard Component (Lab 4 / Issue #51 / UI-01 / FR-06)', () => {
  const mockDashboardData = {
    metrics: {
      openTickets: 3,
      inProgress: 2,
      resolved: 4,
      closed: 5,
    },
    recentTickets: [
      {
        id: 101,
        ticketNumber: 'TKT-2026-001',
        summary: 'Cannot connect to KMUTT-WiFi',
        currentStatus: 'Open',
        category: { id: 1, name: 'Network' },
        updatedAt: '2026-10-29T10:00:00.000Z',
        createdAt: '2026-10-29T08:00:00.000Z',
      },
      {
        id: 102,
        ticketNumber: 'TKT-2026-002',
        summary: 'Laptop display flickering',
        currentStatus: 'In Progress',
        category: { id: 2, name: 'Hardware' },
        updatedAt: '2026-10-29T11:00:00.000Z',
        createdAt: '2026-10-29T09:00:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/dashboards/requester')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData),
        } as Response);
      }
      return Promise.reject(new Error(`Unhandled URL: ${urlStr}`));
    });
  });

  it('UI-01 (FR-06): Renders metric cards with accurate values and labels', async () => {
    render(
      <RequesterDashboard
        onCreateTicket={vi.fn()}
        onViewTicket={vi.fn()}
        onViewAllTickets={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Requester Dashboard')).toBeInTheDocument();
    });

    const openCard = document.getElementById('metric-card-open')!;
    expect(openCard).toBeInTheDocument();
    expect(within(openCard).getByText('My Open Tickets')).toBeInTheDocument();
    expect(within(openCard).getByText('3')).toBeInTheDocument();

    const inProgressCard = document.getElementById('metric-card-inprogress')!;
    expect(inProgressCard).toBeInTheDocument();
    expect(within(inProgressCard).getByText('In Progress')).toBeInTheDocument();
    expect(within(inProgressCard).getByText('2')).toBeInTheDocument();

    const resolvedCard = document.getElementById('metric-card-resolved')!;
    expect(resolvedCard).toBeInTheDocument();
    expect(within(resolvedCard).getByText('Resolved')).toBeInTheDocument();
    expect(within(resolvedCard).getByText('4')).toBeInTheDocument();

    const closedCard = document.getElementById('metric-card-closed')!;
    expect(closedCard).toBeInTheDocument();
    expect(within(closedCard).getByText('Closed')).toBeInTheDocument();
    expect(within(closedCard).getByText('5')).toBeInTheDocument();
  });

  it('UI-01 (FR-06): Displays recent tickets table with summary, category, and status', async () => {
    render(
      <RequesterDashboard
        onCreateTicket={vi.fn()}
        onViewTicket={vi.fn()}
        onViewAllTickets={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('TKT-2026-001')).toBeInTheDocument();
    });

    expect(screen.getByText('Cannot connect to KMUTT-WiFi')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('TKT-2026-002')).toBeInTheDocument();
    expect(screen.getByText('Laptop display flickering')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
  });

  it('Calls onCreateTicket when + Create Ticket button is clicked', async () => {
    const handleCreateTicket = vi.fn();
    render(
      <RequesterDashboard
        onCreateTicket={handleCreateTicket}
        onViewTicket={vi.fn()}
        onViewAllTickets={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('+ Create Ticket')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Create Ticket'));
    expect(handleCreateTicket).toHaveBeenCalledTimes(1);
  });

  it('Calls onViewTicket when clicking View on a recent ticket row', async () => {
    const handleViewTicket = vi.fn();
    render(
      <RequesterDashboard
        onCreateTicket={vi.fn()}
        onViewTicket={handleViewTicket}
        onViewAllTickets={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('TKT-2026-001')).toBeInTheDocument();
    });

    const viewButton = document.getElementById('btn-view-ticket-101');
    expect(viewButton).toBeInTheDocument();
    fireEvent.click(viewButton!);

    expect(handleViewTicket).toHaveBeenCalledWith(101);
  });

  it('Calls onViewAllTickets with filter when clicking a metric card', async () => {
    const handleViewAllTickets = vi.fn();
    render(
      <RequesterDashboard
        onCreateTicket={vi.fn()}
        onViewTicket={vi.fn()}
        onViewAllTickets={handleViewAllTickets}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('My Open Tickets')).toBeInTheDocument();
    });

    const openCard = document.getElementById('metric-card-open');
    expect(openCard).toBeInTheDocument();
    fireEvent.click(openCard!);

    expect(handleViewAllTickets).toHaveBeenCalledWith('Open');
  });
});
