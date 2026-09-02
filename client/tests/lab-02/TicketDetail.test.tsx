import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RequesterProvider } from '../../src/context/RequesterContext.js';
import { TicketDetail } from '../../src/components/TicketDetail.js';
import { vi } from 'vitest';

vi.mock('../../src/context/RequesterContext.js', () => ({
  useRequester: () => ({
    selectedRequester: { id: 1, name: 'Test User' }
  }),
  RequesterProvider: ({ children }: any) => <>{children}</>
}));

describe('TicketDetail Component', () => {
  const dummyTicket = {
    id: 1,
    ticketNumber: 'TKT-999',
    summary: 'Broken Monitor',
    description: 'The screen is completely black.',
    requestedPriority: 'HIGH',
    currentStatus: 'New',
    createdAt: '2026-09-03T10:00:00.000Z',
    category: { name: 'Hardware' },
    relatedSystem: { name: 'Desktop PC' },
    attachments: [
      {
        id: 101,
        fileName: 'screenshot.png',
        fileSize: 102400, // 100KB
        createdAt: '2026-09-03T10:05:00.000Z'
      }
    ]
  };

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      const urlStr = url.toString();
      
      if (urlStr.includes('/api/tickets/1') && !urlStr.includes('/attachments')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(dummyTicket)
        } as Response);
      }

      if (urlStr.includes('/api/attachments/101') && options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        } as Response);
      }
      
      return Promise.reject(new Error('not mocked'));
    });
    
    // Mock window.prompt for the removal reason
    vi.spyOn(window, 'prompt').mockReturnValue('Uploading a better screenshot');
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ticket details and attachments', async () => {
    render(
      <RequesterProvider>
        <TicketDetail ticketId={1} onBack={() => {}} />
      </RequesterProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('TKT-999')).toBeInTheDocument();
    });

    expect(screen.getByText('Broken Monitor')).toBeInTheDocument();
    expect(screen.getByText('The screen is completely black.')).toBeInTheDocument();
    expect(screen.getByText('screenshot.png')).toBeInTheDocument();
    expect(screen.getByText(/100.0 KB/)).toBeInTheDocument();
  });

  it('handles attachment removal', async () => {
    render(
      <RequesterProvider>
        <TicketDetail ticketId={1} onBack={() => {}} />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('screenshot.png')).toBeInTheDocument();
    });

    const removeBtn = screen.getByText('Remove');
    fireEvent.click(removeBtn);

    expect(window.prompt).toHaveBeenCalled();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/attachments/101'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
