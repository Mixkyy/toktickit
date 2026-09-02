import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { checkSystem } from "./api.js";
import { useRequester } from "./context/RequesterContext.js";
import { RequesterSelection } from "./components/RequesterSelection.js";
import { CreateTicket } from "./components/CreateTicket.js";
import { Dashboard } from "./components/Dashboard.js";
export default function App() {
    const [state, setState] = useState("idle");
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [showApp, setShowApp] = useState(false);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const { selectedRequester } = useRequester();
    if (!showApp) {
        return _jsx(RequesterSelection, { onContinue: () => setShowApp(true) });
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
        }
        catch (err) {
            setErrorMessage(err.message || "Failed to connect to the server.");
            setState("error");
        }
    }
    if (isCreatingTicket) {
        return _jsx(CreateTicket, { onCancel: () => setIsCreatingTicket(false) });
    }
    return (_jsxs("div", { className: "container py-5", style: { maxWidth: 960 }, children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-4", children: [_jsxs("h1", { className: "h3 mb-0", children: ["TokTickIT ", _jsx("span", { className: "text-success", children: "IT Service Desk" })] }), _jsxs("div", { className: "text-end", children: [_jsx("div", { className: "small text-muted", children: "Logged in as (Test):" }), _jsx("strong", { children: selectedRequester?.name }), _jsx("div", { children: _jsx("button", { className: "btn btn-link btn-sm p-0 text-decoration-none", onClick: () => setShowApp(false), children: "Change Requester" }) })] })] }), _jsx(Dashboard, { onCreateTicket: () => setIsCreatingTicket(true) }), _jsx("hr", { className: "my-5" }), _jsx("h4", { className: "mb-3 text-muted", children: "System Diagnostics" }), _jsxs("div", { className: "card shadow-sm border-0 bg-light p-4", children: [_jsx("button", { className: "btn btn-outline-secondary mb-3", onClick: handleCheck, disabled: state === "loading", children: state === "loading" ? "Loading…" : "Run System Health Check" }), _jsxs("div", { className: "mt-4", children: [state === "loading" && _jsx("p", { className: "text-muted", children: "Checking..." }), state === "success" && (_jsxs("div", { children: [_jsx("div", { className: "alert alert-success", role: "alert", children: "System Status: Online" }), _jsxs("div", { className: "mt-3", children: [_jsx("h5", { children: "Supported Request Categories:" }), _jsx("ol", { children: categories.map((category) => (_jsx("li", { children: category.name }, category.id))) })] })] })), state === "error" && (_jsxs("div", { className: "alert alert-danger", role: "alert", children: ["System Status: Offline ", _jsx("br", {}), "Unable to connect to TokTickIT API (", errorMessage, ")"] }))] })] })] }));
}
