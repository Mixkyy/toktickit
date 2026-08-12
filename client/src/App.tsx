import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  void categories;

  async function handleCheck() {
    setState("loading");
    setErrorMessage("");

    try {
      // Call the checkSystem API function
      await checkSystem();
      // If it succeeds, update state to success
      setState("success");
    } catch (err: any) {
      // If it fails, capture the error message and set state to error
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
          <div className="alert alert-success" role="alert">
            System Status: Online
          </div>
        )}
        {state === "error" && (
          <div className="alert alert-danger" role="alert">
            System Status: Error ({errorMessage})
          </div>
        )}
      </div>
    </div>
  );
}