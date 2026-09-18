import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dashboard } from '../../src/components/Dashboard.js';
import { RequesterProvider } from '../../src/context/RequesterContext.js';
import { vi } from 'vitest';
describe('Dashboard Component Filtering', () => {
    beforeEach(() => {
        vi.spyOn(global, 'fetch').mockImplementation((url) => {
            const urlStr = url.toString();
            if (urlStr.includes('/api/categories')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([{ id: 1, name: 'Hardware' }])
                });
            }
            if (urlStr.includes('/api/tickets')) {
                // Return dummy tickets. We can inspect the query params if we want to be more strict, 
                // but checking if fetch was called with the right params is easier.
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        {
                            id: 1,
                            ticketNumber: 'TKT-111',
                            summary: 'Broken Mouse',
                            currentStatus: 'New',
                            createdAt: '2026-09-02T10:00:00.000Z',
                            category: { name: 'Hardware' },
                        }
                    ])
                });
            }
            return Promise.reject(new Error('not mocked'));
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('renders table and calls API with status filter', async () => {
        render(_jsx(RequesterProvider, { children: _jsx(Dashboard, { onCreateTicket: () => { } }) }));
        // Initial load
        await waitFor(() => {
            expect(screen.getByText('TKT-111')).toBeInTheDocument();
        });
        // Change status filter
        const statusSelect = screen.getByLabelText(/Status/i);
        fireEvent.change(statusSelect, { target: { value: 'Resolved' } });
        // Wait for debounce and refetch
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('status=Resolved'), expect.any(Object));
        });
    });
    it('calls API with search term', async () => {
        render(_jsx(RequesterProvider, { children: _jsx(Dashboard, { onCreateTicket: () => { } }) }));
        const searchInput = screen.getByPlaceholderText(/Ticket # or keywords.../i);
        fireEvent.change(searchInput, { target: { value: 'Mouse' } });
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('search=Mouse'), expect.any(Object));
        });
    });
});
