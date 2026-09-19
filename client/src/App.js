import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { checkSystem } from "./api.js";
import { useAuth } from "./context/AuthContext.js";
import { Login } from "./components/Login.js";
import { ChangePassword } from "./components/ChangePassword.js";
import { CreateTicket } from "./components/CreateTicket.js";
import { Dashboard } from "./components/Dashboard.js";
import { TicketDetail } from "./components/TicketDetail.js";
import { TicketQueue } from "./components/TicketQueue.js";
import { UserManagement } from "./components/UserManagement.js";
export default function App() {
    const { user, loading, logout } = useAuth();
    const [state, setState] = useState("idle");
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
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
        return _jsx("div", { className: "text-center p-5 mt-5", children: "Loading TokTickIT..." });
    }
    if (!user) {
        return _jsx(Login, {});
    }
    if (user.requiresPasswordChange) {
        return _jsx(ChangePassword, {});
    }
    async function handleCheck() {
        setState("loading");
        setErrorMessage("");
        try {
            await checkSystem();
            const response = await fetch("/api/categories");
            if (!response.ok)
                throw new Error("Failed to fetch categories");
            const data = await response.json();
            setCategories(data);
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
    if (selectedTicketId !== null) {
        return _jsx("div", { className: "container py-5", style: { maxWidth: 960 }, children: _jsx(TicketDetail, { ticketId: selectedTicketId, isStaff: viewQueue, onBack: () => setSelectedTicketId(null) }) });
    }
    return (_jsxs("div", { className: "container py-5", style: { maxWidth: 960 }, children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom", children: [_jsxs("h1", { className: "h3 mb-0", children: ["TokTickIT ", _jsx("span", { className: "text-success", children: "IT Service Desk" })] }), _jsxs("div", { className: "text-end d-flex align-items-center", children: [_jsxs("div", { className: "me-4 text-end", children: [_jsx("div", { className: "small text-muted", children: "Logged in as:" }), _jsx("strong", { children: user.name }), " ", _jsx("span", { className: "badge bg-secondary ms-1", children: user.role })] }), _jsx("div", { children: _jsx("button", { className: "btn btn-outline-danger btn-sm", onClick: logout, children: "Logout" }) })] })] }), _jsxs("div", { className: "mb-4 d-flex gap-2", children: [_jsx("button", { className: `btn btn-sm ${!viewQueue && !viewAdmin ? 'btn-primary' : 'btn-outline-primary'}`, onClick: () => { setViewAdmin(false); setViewQueue(false); }, children: "My Tickets" }), ['IT_STAFF', 'ADMINISTRATOR'].includes(user.role) && (_jsx("button", { className: `btn btn-sm ${viewQueue ? 'btn-success' : 'btn-outline-success'}`, onClick: () => { setViewAdmin(false); setViewQueue(true); }, children: "IT Staff Queue" })), user.role === 'ADMINISTRATOR' && (_jsx("button", { className: `btn btn-sm ${viewAdmin ? 'btn-danger' : 'btn-outline-danger'}`, onClick: () => { setViewQueue(false); setViewAdmin(true); }, children: "User Management" }))] }), viewAdmin && user.role === 'ADMINISTRATOR' ? (_jsx(UserManagement, {})) : viewQueue && ['IT_STAFF', 'ADMINISTRATOR'].includes(user.role) ? (_jsx(TicketQueue, { onViewTicket: (id) => setSelectedTicketId(id) })) : (_jsx(Dashboard, { onCreateTicket: () => setIsCreatingTicket(true), onViewTicket: (id) => setSelectedTicketId(id) })), _jsx("hr", { className: "my-5" }), _jsx("h4", { className: "mb-3 text-muted", children: "System Diagnostics" }), _jsxs("div", { className: "card shadow-sm border-0 bg-light p-4", children: [_jsx("button", { className: "btn btn-outline-secondary mb-3", onClick: handleCheck, disabled: state === "loading", children: state === "loading" ? "Loading…" : "Run System Health Check" }), _jsxs("div", { className: "mt-4", children: [state === "loading" && _jsx("p", { className: "text-muted", children: "Checking..." }), state === "success" && (_jsxs("div", { children: [_jsx("div", { className: "alert alert-success", role: "alert", children: "System Status: Online" }), _jsxs("div", { className: "mt-3", children: [_jsx("h5", { children: "Supported Request Categories:" }), _jsx("ol", { children: categories.map((category) => (_jsx("li", { children: category.name }, category.id))) })] })] })), state === "error" && (_jsxs("div", { className: "alert alert-danger", role: "alert", children: ["System Status: Offline ", _jsx("br", {}), "Unable to connect to TokTickIT API (", errorMessage, ")"] }))] })] })] }));
}
