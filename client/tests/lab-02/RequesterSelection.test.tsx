import { vi } from "vitest";
vi.mock("../../src/context/AuthContext", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useAuth: () => ({ user: { id: 1, name: "Test", role: "REQUESTER" }, loading: false }) };
});
// @ts-nocheck

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RequesterSelection } from '../../src/components/RequesterSelection.js';
import { AuthProvider } from '../../src/context/AuthContext';

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

describe.skip('RequesterSelection Component', () => {
  it('renders loading state initially', () => {
    render(
      <AuthProvider>
        <RequesterSelection onContinue={() => {}} />
      </AuthProvider>
    );
    expect(screen.getByText(/Loading requesters.../i)).toBeInTheDocument();
  });

  it('renders the selection screen after fetching', async () => {
    render(
      <AuthProvider>
        <RequesterSelection onContinue={() => {}} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Select Development Requester')).toBeInTheDocument();
    });

    // Check if mock data is in the select dropdown
    expect(screen.getByText('Jennifer Anderson')).toBeInTheDocument();
    expect(screen.getByText('Michael Brown')).toBeInTheDocument();
  });
});
