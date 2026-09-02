import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RequesterSelection } from '../../src/components/RequesterSelection.js';
import { RequesterProvider } from '../../src/context/RequesterContext.js';

import { vi } from 'vitest';

// Mock fetch
vi.spyOn(global, 'fetch').mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, name: 'Jennifer Anderson', email: 'jennifer@example.com' },
      { id: 2, name: 'Michael Brown', email: 'michael@example.com' },
    ]),
  } as Response)
);

describe('RequesterSelection Component', () => {
  it('renders loading state initially', () => {
    render(
      <RequesterProvider>
        <RequesterSelection onContinue={() => {}} />
      </RequesterProvider>
    );
    expect(screen.getByText(/Loading requesters.../i)).toBeInTheDocument();
  });

  it('renders the selection screen after fetching', async () => {
    render(
      <RequesterProvider>
        <RequesterSelection onContinue={() => {}} />
      </RequesterProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Select Development Requester')).toBeInTheDocument();
    });

    // Check if mock data is in the select dropdown
    expect(screen.getByText('Jennifer Anderson')).toBeInTheDocument();
    expect(screen.getByText('Michael Brown')).toBeInTheDocument();
  });
});
