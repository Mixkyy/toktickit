import "@testing-library/jest-dom";
import { vi } from "vitest";

// Globally mock useAuth for all Lab 2 tests that were converted to Lab 3
vi.mock(/AuthContext/, () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', role: 'REQUESTER' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn()
  }),
  AuthProvider: ({ children }) => children
}));
