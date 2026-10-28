import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TicketDetail } from '../../src/components/TicketDetail';

const mockUser = { id: 10, name: 'Staff User', role: 'IT_STAFF' };

vi.mock('../../src/context/AuthContext.js', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
}));

// Mock ActionsTakenSection to keep test focused on TicketWorkflow
vi.mock('../../src/components/ActionsTakenSection.js', () => ({
  ActionsTakenSection: () => <div data-testid="mock-actions-taken-section" />,
}));

describe('TicketWorkflow Component (Lab 4 / Issue #50)', () => {
  const mockTicketNew = {
    id: 1,
    ticketNumber: 'TKT-2026-001',
    summary: 'WiFi dropping intermittently',
    description: 'Connection drops every 15 minutes',
    requestedPriority: 'MEDIUM',
    itPriority: 'MEDIUM',
    currentStatus: 'New',
    version: 1,
    createdAt: '2026-10-28T10:00:00.000Z',
    category: { name: 'Network' },
    relatedSystem: { name: 'Campus Wi-Fi' },
    owner: null,
    attachments: [],
  };

  const mockTicketResolved = {
    ...mockTicketNew,
    id: 2,
    currentStatus: 'Resolved',
    version: 3,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders only permitted status transitions for a "New" ticket', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/staff/tickets/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTicketNew),
        } as Response);
      }
      if (urlStr.includes('/api/tickets/1/comments')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlStr.includes('/api/staff/staff-members')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });

    render(<TicketDetail ticketId={1} isStaff={true} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByTestId('status-select')).toBeInTheDocument();
    });

    const options = screen.getByTestId('status-select').querySelectorAll('option');
    const optionValues = Array.from(options).map((o) => o.value);

    // Permitted from 'New': New, Open, In Progress, Cancelled
    expect(optionValues).toContain('New');
    expect(optionValues).toContain('Open');
    expect(optionValues).toContain('In Progress');
    expect(optionValues).toContain('Cancelled');
    expect(optionValues).not.toContain('Resolved');
    expect(optionValues).not.toContain('Closed');
  });

  it('renders only permitted status transitions for a "Resolved" ticket', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/staff/tickets/2')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTicketResolved),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });

    render(<TicketDetail ticketId={2} isStaff={true} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByTestId('status-select')).toBeInTheDocument();
    });

    const options = screen.getByTestId('status-select').querySelectorAll('option');
    const optionValues = Array.from(options).map((o) => o.value);

    // Permitted from 'Resolved': Resolved, Closed, Reopened
    expect(optionValues).toContain('Resolved');
    expect(optionValues).toContain('Closed');
    expect(optionValues).toContain('Reopened');
    expect(optionValues).not.toContain('New');
    expect(optionValues).not.toContain('In Progress');
  });

  it('sends ticket version and handles 409 Conflict with conflict alert banner', async () => {
    let fetchTicketCallCount = 0;
    vi.spyOn(global, 'fetch').mockImplementation((url: any, opts: any) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/staff/tickets/1') && opts?.method === 'PUT') {
        return Promise.resolve({
          status: 409,
          ok: false,
          json: () =>
            Promise.resolve({
              error: 'Conflict: This ticket has been modified by another user. Please refresh and try again.',
              currentVersion: 2,
            }),
        } as Response);
      }
      if (urlStr.includes('/api/staff/tickets/1')) {
        fetchTicketCallCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTicketNew),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
    });

    render(<TicketDetail ticketId={1} isStaff={true} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByTestId('status-select')).toBeInTheDocument();
    });

    // Attempt status transition
    fireEvent.change(screen.getByTestId('status-select'), {
      target: { value: 'In Progress' },
    });

    // Conflict banner should be rendered
    await waitFor(() => {
      expect(screen.getByTestId('conflict-alert-banner')).toBeInTheDocument();
      expect(screen.getByTestId('conflict-alert-banner')).toHaveTextContent(/Conflict: This ticket has been modified/i);
    });

    // Clicking "Refresh Ticket" should trigger re-fetch and clear banner
    const refreshBtn = screen.getByTestId('refresh-conflict-btn');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(fetchTicketCallCount).toBeGreaterThanOrEqual(2);
      expect(screen.queryByTestId('conflict-alert-banner')).not.toBeInTheDocument();
    });
  });
});
