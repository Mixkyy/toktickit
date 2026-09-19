import { useState, useEffect } from "react";
import { checkSystem, Category } from "./api.js";
import { useAuth } from "./context/AuthContext.js";
import { Login } from "./components/Login.js";
import { ChangePassword } from "./components/ChangePassword.js";

import { CreateTicket } from "./components/CreateTicket.js";
import { Dashboard } from "./components/Dashboard.js";
import { TicketDetail } from "./components/TicketDetail.js";
import { TicketQueue } from "./components/TicketQueue.js";
import { UserManagement } from "./components/UserManagement.js";

type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const { user, loading, logout } = useAuth();
  
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  
  // Navigation states
  const [viewQueue, setViewQueue] = useState(false);
  const [viewAdmin, setViewAdmin] = useState(false);

  // Reset views on logout/login changes
  useEffect(() => {
    setViewQueue(false);
    setViewAdmin(false);
    setSelectedTicketId(null);
    setIsCreatingTicket(false);
  }, [user]);

  if (loading) {
    return <div className="text-center p-5 mt-5">Loading TokTickIT...</div>;
  }

  if (!user) {
    return <Login />;
  }

  if (user.requiresPasswordChange) {
    return <ChangePassword />;
  }

  async function handleCheck() {
    setState("loading");
    setErrorMessage("");

    try {
      await checkSystem();
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
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
      <TicketDetail ticketId={selectedTicketId} isStaff={viewQueue} onBack={() => setSelectedTicketId(null)} />
    </div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: 960 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h1 className="h3 mb-0">
          TokTickIT <span className="text-success">IT Service Desk</span>
        </h1>
        <div className="text-end d-flex align-items-center">
          <div className="me-4 text-end">
            <div className="small text-muted">Logged in as:</div>
            <strong>{user.name}</strong> <span className="badge bg-secondary ms-1">{user.role}</span>
          </div>
          <div>
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Role-Based Navigation */}
      <div className="mb-4 d-flex gap-2">
        <button 
          className={`btn btn-sm ${!viewQueue && !viewAdmin ? 'btn-primary' : 'btn-outline-primary'}`} 
          onClick={() => { setViewAdmin(false); setViewQueue(false); }}
        >
          My Tickets
        </button>

        {['IT_STAFF', 'ADMINISTRATOR'].includes(user.role) && (
          <button 
            className={`btn btn-sm ${viewQueue ? 'btn-success' : 'btn-outline-success'}`} 
            onClick={() => { setViewAdmin(false); setViewQueue(true); }}
          >
            IT Staff Queue
          </button>
        )}

        {user.role === 'ADMINISTRATOR' && (
          <button 
            className={`btn btn-sm ${viewAdmin ? 'btn-danger' : 'btn-outline-danger'}`} 
            onClick={() => { setViewQueue(false); setViewAdmin(true); }}
          >
            User Management
          </button>
        )}
      </div>

      {viewAdmin && user.role === 'ADMINISTRATOR' ? (
        <UserManagement />
      ) : viewQueue && ['IT_STAFF', 'ADMINISTRATOR'].includes(user.role) ? (
        <TicketQueue onViewTicket={(id) => setSelectedTicketId(id)} />
      ) : (
        <Dashboard 
          onCreateTicket={() => setIsCreatingTicket(true)} 
          onViewTicket={(id) => setSelectedTicketId(id)}
        />
      )}

      <hr className="my-5" />
      <h4 className="mb-3 text-muted">System Diagnostics</h4>
      <div className="card shadow-sm border-0 bg-light p-4">
        <button className="btn btn-outline-secondary mb-3" onClick={handleCheck} disabled={state === "loading"}>
          {state === "loading" ? "Loading…" : "Run System Health Check"}
        </button>

        <div className="mt-4">
          {state === "loading" && <p className="text-muted">Checking...</p>}
          {state === "success" && (
            <div>
              <div className="alert alert-success" role="alert">System Status: Online</div>
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
              System Status: Offline <br/>Unable to connect to TokTickIT API ({errorMessage})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}