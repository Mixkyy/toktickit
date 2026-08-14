import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

// Use globalThis instead of global for browser/Vite environments
globalThis.fetch = vi.fn() as any;

describe("App", () => {
  it("renders the TokTickIT heading", () => {
    render(<App />);
    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
  });

  it("shows Online and the seeded categories on success", async () => {
    // 1. Mock the api.checkSystem function to simulate a successful backend connection
    vi.spyOn(api, "checkSystem").mockResolvedValue({ status: "ok", service: "TokTickIT API" } as any);
    
    // 2. Mock the fetch call using globalThis
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Account and Access" },
        { id: 2, name: "Hardware" },
        { id: 3, name: "Software" },
        { id: 4, name: "Network" }
      ]
    });

    render(<App />);
    
    // 3. Simulate clicking the Check System button
    fireEvent.click(screen.getByText("[Check System]"));
    
    // 4. Wait for the UI to update and verify the success text and categories are visible
    await waitFor(() => {
      expect(screen.getByText(/System Status: Online/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Account and Access")).toBeInTheDocument();
    expect(screen.getByText("Network")).toBeInTheDocument();
  });

  it("shows an Offline error message when the API is unavailable", async () => {
    // 1. Mock the api.checkSystem function to simulate a crash/offline state
    vi.spyOn(api, "checkSystem").mockRejectedValue(new Error("Failed to connect to TokTickIT API"));
    
    render(<App />);
    
    // 2. Simulate clicking the Check System button
    fireEvent.click(screen.getByText("[Check System]"));
    
    // 3. Wait for the UI to update and verify the error message is visible
    await waitFor(() => {
      expect(screen.getByText(/System Status: Offline/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Failed to connect to TokTickIT API/i)).toBeInTheDocument();
  });
});