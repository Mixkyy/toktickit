import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateTicket } from '../../src/components/CreateTicket.js';
import { RequesterProvider } from '../../src/context/RequesterContext.js';
import { vi } from 'vitest';

// Mock fetch
vi.spyOn(global, 'fetch').mockImplementation((url) => {
  if (url === 'http://localhost:3000/api/categories') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Hardware' }])
    } as Response);
  }
  if (url === 'http://localhost:3000/api/related-systems') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Corporate Laptop' }])
    } as Response);
  }
  if (url === 'http://localhost:3000/api/tickets') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1, ticketNumber: 'TKT-20231015120000' })
    } as Response);
  }
  return Promise.reject(new Error('not mocked'));
});

describe('CreateTicket Component Validation', () => {
  it('shows validation errors when submitting empty form', async () => {
    render(
      <RequesterProvider>
        <CreateTicket onCancel={() => {}} />
      </RequesterProvider>
    );

    const submitBtn = screen.getByText('Submit Ticket');
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Category is required')).toBeInTheDocument();
    expect(await screen.findByText('Related system is required')).toBeInTheDocument();
    expect(await screen.findByText('Summary is required')).toBeInTheDocument();
    expect(await screen.findByText('Description is required')).toBeInTheDocument();
  });

  it('shows error if summary is too long', async () => {
    render(
      <RequesterProvider>
        <CreateTicket onCancel={() => {}} />
      </RequesterProvider>
    );

    const summaryInput = screen.getByPlaceholderText(/Brief summary of the issue/i);
    // 101 characters
    fireEvent.change(summaryInput, { target: { value: 'a'.repeat(101) } });

    const submitBtn = screen.getByText('Submit Ticket');
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Summary must be 100 characters or less')).toBeInTheDocument();
  });
});
