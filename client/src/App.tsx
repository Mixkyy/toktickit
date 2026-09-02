import { useState } from "react";
import { checkSystem, Category } from "./api.js";
import { useRequester } from "./context/RequesterContext.js";
import { RequesterSelection } from "./components/RequesterSelection.js";
import { CreateTicket } from "./components/CreateTicket.js";

import { Dashboard } from "./components/Dashboard.js";
import { TicketDetail } from "./components/TicketDetail.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showApp, setShowApp] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const { selectedRequester } = useRequester();

  if (!showApp) {
    return <RequesterSelection onContinue={() => setShowApp(true)} />;
  }

  async function handleCheck() {
    setState("loading");
    setErrorMessage("");

    try {
      // 1. Verify system health (Issue 2)
      await checkSystem();

      // 2. Fetch categories from your new Express API (Issue 4)
      // Note: Assuming your backend is running on port 3000
      const response = await fetch("http://localhost:3000/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      
      // 3. Parse the JSON and update your state
      const data = await response.json();
      setCategories(data);
      
      // 4. Mark as successful
      setState("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to the server.");
      setState("error");
    }
  }

  if (isCreatingTicket) {
    return <CreateTicket onCancel={() => setIsCreatingTicket(false)} />;
  }

  if (selectedTicketId !== null) {
    return <div className="container py-5" style={{ maxWidth: 960 }}>
      <TicketDetail ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />
    </div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: 960 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          TokTickIT <span className="text-success">IT Service Desk</span>
        </h1>
        <div className="text-end">
          <div className="small text-muted">Logged in as (Test):</div>
          <strong>{selectedRequester?.name}</strong>
          <div>
            <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => setShowApp(false)}>
              Change Requester
            </button>
          </div>
        </div>
      </div>

      <Dashboard 
        onCreateTicket={() => setIsCreatingTicket(true)} 
        onViewTicket={(id) => setSelectedTicketId(id)}
      />

      <hr className="my-5" />
      <h4 className="mb-3 text-muted">System Diagnostics</h4>
      <div className="card shadow-sm border-0 bg-light p-4">
        <button className="btn btn-outline-secondary mb-3" onClick={handleCheck} disabled={state === "loading"}>
          {state === "loading" ? "Loading…" : "Run System Health Check"}
        </button>

      {/* UI States rendering */}
      <div className="mt-4">
        {state === "loading" && <p className="text-muted">Checking...</p>}
        
        {state === "success" && (
          <div>
            <div className="alert alert-success" role="alert">
              System Status: Online
            </div>
            
            {/* The dynamically rendered list of categories */}
            <div className="mt-3">
              <h5>Supported Request Categories:</h5>
              <ol>
                {categories.map((category) => (
                  <li key={category.id}>{category.name}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
        
        {state === "error" && (
          <div className="alert alert-danger" role="alert">
            System Status: Offline <br/>
            Unable to connect to TokTickIT API ({errorMessage})
          </div>
        )}
      </div>
      </div>
    </div>
  );
}