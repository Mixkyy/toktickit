const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

// Issue 2 + Issue 4 — call the backend.
// Steps: fetch `${API_URL}/api/health`; if not ok, throw.
//        then fetch `${API_URL}/api/categories`; if not ok, throw.
//        return { online: true, categories }.
// Throwing on failure lets the UI show a single Offline/error state.
export async function checkSystem(): Promise<SystemStatus> {
  // 1. Fetch the health check endpoint you built in Issue 2
  const response = await fetch("http://localhost:3000/api/health");

  // 2. If the backend is down or returns an error, throw it so App.tsx can catch it
  if (!response.ok) {
    throw new Error("Failed to connect to TokTickIT API");
  }

  // 3. Return the parsed JSON data
  return await response.json();
}
