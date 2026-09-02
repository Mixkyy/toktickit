import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

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

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-4">
        TokTickIT <span className="text-success">IT Service Desk</span>
      </h1>

      <button className="btn btn-success" onClick={handleCheck} disabled={state === "loading"}>
        {state === "loading" ? "Loading…" : "[Check System]"}
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
  );
}