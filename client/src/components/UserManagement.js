import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
export function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "REQUESTER",
        isActive: true,
        initialPassword: ""
    });
    const fetchUsers = async () => {
        try {
            const query = new URLSearchParams();
            if (search)
                query.append("search", search);
            if (roleFilter)
                query.append("role", roleFilter);
            const res = await fetch(`/api/users?${query.toString()}`, {
                headers: { 'Authorization': `Bearer temp` }
            });
            if (res.ok) {
                setUsers(await res.json());
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter]);
    const handleOpenCreate = () => {
        setEditingUserId(null);
        setFormData({ name: "", email: "", role: "REQUESTER", isActive: true, initialPassword: "" });
        setShowModal(true);
    };
    const handleOpenEdit = (user) => {
        setEditingUserId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            initialPassword: ""
        });
        setShowModal(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingUserId
                ? `/api/users/${editingUserId}`
                : `/api/users`;
            const payload = { ...formData };
            if (editingUserId && payload.initialPassword) {
                payload.newInitialPassword = payload.initialPassword;
                delete payload.initialPassword;
            }
            if (editingUserId && !payload.initialPassword && !payload.newInitialPassword) {
                delete payload.initialPassword;
                delete payload.newInitialPassword;
            }
            const res = await fetch(url, {
                method: editingUserId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer temp` },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Failed to save user");
                return;
            }
            setShowModal(false);
            fetchUsers();
        }
        catch (err) {
            alert("An error occurred");
        }
    };
    return (_jsxs("div", { className: "container py-4", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-4", children: [_jsx("h2", { style: { color: '#006B3C' }, children: "User Management" }), _jsx("button", { className: "btn btn-success", onClick: handleOpenCreate, children: "+ Create User" })] }), _jsx("div", { className: "card shadow-sm border-0 mb-4", children: _jsxs("div", { className: "card-body p-3 bg-light rounded d-flex gap-3", children: [_jsx("input", { type: "text", className: "form-control w-50", placeholder: "Search by name or email...", value: search, onChange: (e) => setSearch(e.target.value) }), _jsxs("select", { className: "form-select w-25", value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), children: [_jsx("option", { value: "", children: "All Roles" }), _jsx("option", { value: "REQUESTER", children: "Requester" }), _jsx("option", { value: "IT_STAFF", children: "IT Staff" }), _jsx("option", { value: "ADMINISTRATOR", children: "Administrator" })] })] }) }), loading ? (_jsx("div", { className: "text-center py-5", children: "Loading users..." })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsxs("tbody", { children: [users.map(u => (_jsxs("tr", { children: [_jsx("td", { className: "fw-bold", children: u.name }), _jsx("td", { children: u.email }), _jsx("td", { children: _jsx("span", { className: `badge ${u.role === 'ADMINISTRATOR' ? 'bg-danger' : u.role === 'IT_STAFF' ? 'bg-info text-dark' : 'bg-secondary'}`, children: u.role }) }), _jsx("td", { children: u.isActive ? (_jsx("span", { className: "badge bg-success", children: "Active" })) : (_jsx("span", { className: "badge bg-danger", children: "Inactive" })) }), _jsx("td", { children: _jsx("button", { className: "btn btn-sm btn-outline-primary", onClick: () => handleOpenEdit(u), children: "Edit" }) })] }, u.id))), users.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-muted fst-italic", children: "No users found." }) }))] })] }) })), showModal && (_jsx("div", { className: "modal show d-block", style: { backgroundColor: 'rgba(0,0,0,0.5)' }, children: _jsx("div", { className: "modal-dialog", children: _jsxs("div", { className: "modal-content border-0 shadow", children: [_jsxs("div", { className: "modal-header text-white", style: { backgroundColor: '#006B3C' }, children: [_jsx("h5", { className: "modal-title", children: editingUserId ? 'Edit User' : 'Create New User' }), _jsx("button", { type: "button", className: "btn-close btn-close-white", onClick: () => setShowModal(false) })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "modal-body p-4", children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label fw-bold small text-muted", children: "Full Name *" }), _jsx("input", { type: "text", className: "form-control", value: formData.name, onChange: e => setFormData({ ...formData, name: e.target.value }), required: true })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label fw-bold small text-muted", children: "Email Address *" }), _jsx("input", { type: "email", className: "form-control", value: formData.email, onChange: e => setFormData({ ...formData, email: e.target.value }), required: true })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label fw-bold small text-muted", children: "Role *" }), _jsxs("select", { className: "form-select", value: formData.role, onChange: e => setFormData({ ...formData, role: e.target.value }), children: [_jsx("option", { value: "REQUESTER", children: "Requester" }), _jsx("option", { value: "IT_STAFF", children: "IT Staff" }), _jsx("option", { value: "ADMINISTRATOR", children: "Administrator" })] })] }), _jsx("div", { className: "mb-4", children: _jsxs("div", { className: "form-check form-switch", children: [_jsx("input", { className: "form-check-input", type: "checkbox", checked: formData.isActive, onChange: e => setFormData({ ...formData, isActive: e.target.checked }) }), _jsx("label", { className: "form-check-label fw-bold small text-muted", children: "Account Active" })] }) }), _jsxs("div", { className: "p-3 bg-light border rounded", children: [_jsx("label", { className: "form-label fw-bold small text-muted", children: editingUserId ? 'Set New Initial Password (Optional)' : 'Initial Password *' }), _jsx("input", { type: "text", className: "form-control mb-2", value: formData.initialPassword, onChange: e => setFormData({ ...formData, initialPassword: e.target.value }), required: !editingUserId }), _jsxs("div", { className: "form-text small", children: [_jsx("i", { className: "bi bi-info-circle text-primary" }), " User will be forced to change this password on their next login."] })] })] }), _jsxs("div", { className: "modal-footer bg-light", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowModal(false), children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn-success text-white", style: { backgroundColor: '#006B3C' }, children: "Save User" })] })] })] }) }) }))] }));
}
