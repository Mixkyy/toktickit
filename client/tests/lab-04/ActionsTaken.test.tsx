import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionsTakenSection, ActionTaken } from '../../src/components/ActionsTakenSection';

vi.mock('../../src/context/AuthContext.js', () => ({
  useAuth: () => ({
    user: { id: 10, name: 'Staff John', role: 'IT_STAFF' },
    loading: false,
  }),
}));

describe('ActionsTakenSection Component (Lab 4 / Issue #49)', () => {
  const mockActions: ActionTaken[] = [
    {
      id: 101,
      ticketId: 1,
      actionDate: '2026-10-28T10:00:00.000Z',
      description: 'Replaced swollen battery pack.',
      result: 'Laptop boots and holds charge.',
      performedById: 10,
      performedBy: {
        id: 10,
        name: 'Staff John',
        email: 'john@example.com',
        role: 'IT_STAFF',
      },
      followUpRequired: true,
      followUpNote: 'Check battery calibration tomorrow.',
      attachmentNotes: 'battery_invoice.pdf',
      createdAt: '2026-10-28T10:00:00.000Z',
      updatedAt: '2026-10-28T10:00:00.000Z',
    },
    {
      id: 102,
      ticketId: 1,
      actionDate: '2026-10-28T12:00:00.000Z',
      description: 'Cleaned motherboard contacts.',
      result: 'No residue remaining.',
      performedById: 11,
      performedBy: {
        id: 11,
        name: 'Staff Mary',
        email: 'mary@example.com',
        role: 'IT_STAFF',
      },
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: null,
      createdAt: '2026-10-28T12:00:00.000Z',
      updatedAt: '2026-10-28T12:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation((url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/tickets/1/actions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockActions),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
  });

  it('renders existing Actions Taken in list mode with details', async () => {
    render(<ActionsTakenSection ticketId={1} isStaff={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Actions Taken \(2\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Replaced swollen battery pack.')).toBeInTheDocument();
    expect(screen.getByText('Laptop boots and holds charge.')).toBeInTheDocument();
    expect(screen.getByText('Staff John')).toBeInTheDocument();
    expect(screen.getByText(/Check battery calibration tomorrow./i)).toBeInTheDocument();
    expect(screen.getByText(/battery_invoice.pdf/i)).toBeInTheDocument();

    expect(screen.getByText('Cleaned motherboard contacts.')).toBeInTheDocument();
    expect(screen.getByText('Staff Mary')).toBeInTheDocument();
  });

  it('Requester view is read-only: no log button or edit controls', async () => {
    render(<ActionsTakenSection ticketId={1} isStaff={false} />);

    await waitFor(() => {
      expect(screen.getByText('Replaced swollen battery pack.')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('log-action-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-action-btn-101')).not.toBeInTheDocument();
  });

  it('Staff view allows opening the Create Action Taken form', async () => {
    render(<ActionsTakenSection ticketId={1} isStaff={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('log-action-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('log-action-btn'));

    expect(screen.getByText('New Action Taken')).toBeInTheDocument();
    expect(screen.getByLabelText(/Action Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Result/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Follow-Up Required\?/i)).toBeInTheDocument();
  });

  it('validates that Follow-up Note is required when Follow-Up Required is checked', async () => {
    render(<ActionsTakenSection ticketId={1} isStaff={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('log-action-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('log-action-btn'));

    fireEvent.change(screen.getByLabelText(/Action Description/i), {
      target: { value: 'Inspected heat sink' },
    });
    fireEvent.change(screen.getByLabelText(/Result/i), {
      target: { value: 'Thermal pads dry' },
    });

    // Check follow up checkbox
    const checkbox = screen.getByLabelText(/Follow-Up Required\?/i);
    fireEvent.click(checkbox);

    // Leave follow up note empty and submit form
    const form = screen.getByTestId('action-form-card').querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByTestId('form-error-alert')).toHaveTextContent(
      /Follow-up note is required when follow-up is needed/i
    );
  });

  it('submits valid Action Taken to POST /api/tickets/:id/actions', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation((url: any, opts: any) => {
      const urlStr = url.toString();
      if (opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 103,
              ticketId: 1,
              actionDate: new Date().toISOString(),
              description: 'Replaced CPU fan',
              result: 'Normal RPM',
              performedById: 10,
              followUpRequired: false,
              followUpNote: null,
              attachmentNotes: null,
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockActions),
      } as Response);
    });

    render(<ActionsTakenSection ticketId={1} isStaff={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('log-action-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('log-action-btn'));

    fireEvent.change(screen.getByLabelText(/Action Description/i), {
      target: { value: 'Replaced CPU fan' },
    });
    fireEvent.change(screen.getByLabelText(/Result/i), {
      target: { value: 'Normal RPM' },
    });

    fireEvent.click(screen.getByTestId('save-action-btn'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/tickets/1/actions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            description: 'Replaced CPU fan',
            result: 'Normal RPM',
            followUpRequired: false,
            followUpNote: null,
            attachmentNotes: null,
          }),
        })
      );
    });
  });

  it('allows IT Staff to edit an existing action via PUT /api/tickets/:id/actions/:actionId', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation((url: any, opts: any) => {
      if (opts?.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockActions[0],
              result: 'Updated result after testing',
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockActions),
      } as Response);
    });

    render(<ActionsTakenSection ticketId={1} isStaff={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-action-btn-101')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-action-btn-101'));

    expect(screen.getByText('Edit Action Taken')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Replaced swollen battery pack.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Result/i), {
      target: { value: 'Updated result after testing' },
    });

    fireEvent.click(screen.getByTestId('save-action-btn'));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/tickets/1/actions/101',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });
});
