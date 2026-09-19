import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.js";
export const TicketDetail = ({ ticketId, isStaff, onBack }) => {
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const fileInputRef = useRef(null);
    const fetchTicket = async () => {
        if (!user)
            return;
        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                headers: { 'X-Requester-Id': String(user.id) }
            });
            if (!res.ok)
                throw new Error("Failed to load ticket details");
            const data = await res.json();
            setTicket(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchComments = async () => {
        if (!user)
            return;
        try {
            const res = await fetch(`/api/tickets/${ticketId}/comments`, {
                // Fallback for UI mock:
                headers: { 'Authorization': `Bearer temp` }
            });
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchTicket();
        fetchComments();
    }, [ticketId, user]);
    const updateTicket = async (field, value) => {
        try {
            const res = await fetch(`/api/staff/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer temp` },
                body: JSON.stringify({ [field]: value })
            });
            if (res.ok) {
                fetchTicket(); // refresh data
            }
        }
        catch (err) {
            alert("Failed to update ticket.");
        }
    };
    const handleClaim = () => {
        if (!user)
            return;
        updateTicket('ownerId', user.id);
    };
    const handleStatusChange = (e) => updateTicket('currentStatus', e.target.value);
    const handlePriorityChange = (e) => updateTicket('itPriority', e.target.value);
    const submitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim())
            return;
        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer temp` },
                body: JSON.stringify({ content: newComment, isInternal })
            });
            if (res.ok) {
                setNewComment("");
                setIsInternal(false);
                fetchComments();
            }
            else {
                alert("Failed to post comment.");
            }
        }
        catch (err) {
            alert("Error posting comment.");
        }
        finally {
            setSubmittingComment(false);
        }
    };
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user)
            return;
        if (file.size > 5 * 1024 * 1024)
            return alert("File size exceeds 5MB limit");
        const formData = new FormData();
        formData.append("attachment", file);
        setUploading(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
                method: "POST", headers: { 'X-Requester-Id': String(user.id) }, body: formData
            });
            if (!res.ok)
                throw new Error("Upload failed");
            await fetchTicket();
            if (fileInputRef.current)
                fileInputRef.current.value = "";
        }
        catch (err) {
            alert(err.message);
        }
        finally {
            setUploading(false);
        }
    };
    const handleDownload = async (attachmentId, fileName) => {
        if (!user)
            return;
        try {
            const res = await fetch(`/api/attachments/${attachmentId}/download`, { headers: { 'X-Requester-Id': String(user.id) } });
            if (!res.ok)
                throw new Error("Failed to download");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
        catch (err) {
            alert("Could not download file.");
        }
    };
    const handleRemove = async (attachmentId) => {
        if (!user)
            return;
        const reason = window.prompt("Reason for removal:");
        if (!reason || reason.trim() === "")
            return alert("Reason required.");
        try {
            const res = await fetch(`/api/attachments/${attachmentId}`, {
                method: "DELETE", headers: { 'X-Requester-Id': String(user.id), 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (!res.ok)
                throw new Error("Failed to remove");
            await fetchTicket();
        }
        catch (err) {
            alert("Could not remove attachment.");
        }
    };
    if (loading)
        return _jsx("div", { className: "text-center p-5", children: "Loading ticket details..." });
    if (error || !ticket)
        return _jsx("div", { className: "alert alert-danger", children: error || "Ticket not found" });
    return (_jsxs("div", { className: "card shadow-sm border-0 mt-4", children: [_jsxs("div", { className: "card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsxs("button", { className: "btn btn-link btn-sm p-0 text-decoration-none text-muted mb-2", onClick: onBack, children: ["\u2190 Back to ", isStaff ? "Queue" : "My Tickets"] }), _jsx("h2", { style: { color: '#006B3C' }, children: ticket.ticketNumber }), _jsx("p", { className: "text-muted mb-0", children: ticket.summary })] }), _jsx("span", { className: "badge bg-primary px-3 py-2 fs-6 rounded-pill", children: ticket.currentStatus })] }), _jsxs("div", { className: "card-body p-4 row", children: [_jsxs("div", { className: isStaff ? "col-md-8" : "col-12", children: [_jsxs("div", { className: "row mb-4", children: [_jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("div", { className: "small text-muted fw-bold text-uppercase", children: "Category" }), _jsx("div", { children: ticket.category.name })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("div", { className: "small text-muted fw-bold text-uppercase", children: "Related System" }), _jsx("div", { children: ticket.relatedSystem.name })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("div", { className: "small text-muted fw-bold text-uppercase", children: "Priority" }), _jsx("div", { children: ticket.itPriority || ticket.requestedPriority })] }), _jsxs("div", { className: "col-md-12 mb-3 mt-3", children: [_jsx("div", { className: "small text-muted fw-bold text-uppercase mb-2", children: "Description" }), _jsx("div", { className: "p-3 bg-light rounded", style: { whiteSpace: 'pre-wrap' }, children: ticket.description })] })] }), _jsx("hr", { className: "my-4" }), _jsxs("h4", { style: { color: '#006B3C' }, className: "mb-3", children: ["Attachments (", ticket.attachments.length, "/5)"] }), ticket.attachments.length > 0 ? (_jsx("ul", { className: "list-group mb-4", children: ticket.attachments.map(att => (_jsxs("li", { className: `list-group-item d-flex justify-content-between align-items-center border-0 mb-2 rounded ${att.isRemoved ? 'bg-white border' : 'bg-light'}`, children: [_jsxs("div", { children: [_jsx("strong", { className: att.isRemoved ? 'text-decoration-line-through text-muted' : '', children: att.fileName }), att.isRemoved && _jsx("span", { className: "badge bg-danger ms-2", children: "Removed" }), _jsx("br", {}), _jsxs("small", { className: "text-muted", children: [(att.fileSize / 1024).toFixed(1), " KB \u2022 Uploaded ", new Date(att.createdAt).toLocaleDateString()] })] }), _jsx("div", { children: !att.isRemoved ? (_jsxs(_Fragment, { children: [_jsx("button", { className: "btn btn-sm btn-outline-primary me-2", onClick: () => handleDownload(att.id, att.fileName), children: "Download" }), _jsx("button", { className: "btn btn-sm btn-outline-danger", onClick: () => handleRemove(att.id), children: "Remove" })] })) : _jsx("button", { className: "btn btn-sm btn-secondary", disabled: true, children: "Unavailable" }) })] }, att.id))) })) : _jsx("p", { className: "text-muted fst-italic", children: "No active attachments." }), ticket.attachments.filter(a => !a.isRemoved).length < 5 && (_jsxs("div", { className: "p-3 rounded border mb-4", style: { backgroundColor: '#F5F7F6' }, children: [_jsx("label", { className: "form-label fw-bold small text-muted", children: "Upload New Attachment" }), _jsx("input", { type: "file", className: "form-control", ref: fileInputRef, accept: ".jpg,.jpeg,.png,.webp,.pdf", onChange: handleUpload, disabled: uploading }), _jsx("div", { className: "form-text", children: "Max 5MB. JPG, PNG, WEBP, or PDF." })] })), _jsx("hr", { className: "my-4" }), _jsx("h4", { style: { color: '#006B3C' }, className: "mb-3", children: "Discussion" }), _jsxs("div", { className: "comments-feed mb-4", children: [comments.map(c => (_jsx("div", { className: `card mb-3 border-0 shadow-sm ${c.isInternal ? 'bg-warning bg-opacity-10' : 'bg-light'}`, children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex justify-content-between mb-2", children: [_jsxs("strong", { children: [c.author.name, " ", _jsx("span", { className: "badge bg-secondary ms-1", children: c.author.role })] }), _jsx("small", { className: "text-muted", children: new Date(c.createdAt).toLocaleString() })] }), _jsx("p", { className: "mb-0", style: { whiteSpace: 'pre-wrap' }, children: c.content }), c.isInternal && _jsx("span", { className: "badge bg-warning text-dark mt-2", children: "Internal Note" })] }) }, c.id))), comments.length === 0 && _jsx("p", { className: "text-muted fst-italic", children: "No comments yet." })] }), _jsxs("form", { onSubmit: submitComment, className: "p-3 bg-light rounded border", children: [_jsx("div", { className: "mb-2", children: _jsx("textarea", { className: "form-control", rows: 3, placeholder: "Write a comment...", value: newComment, onChange: e => setNewComment(e.target.value), required: true }) }), _jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [isStaff && (_jsxs("div", { className: "form-check", children: [_jsx("input", { className: "form-check-input", type: "checkbox", id: "isInternal", checked: isInternal, onChange: e => setIsInternal(e.target.checked) }), _jsx("label", { className: "form-check-label fw-bold text-warning", htmlFor: "isInternal", children: "Make Internal Note" })] })), _jsx("button", { type: "submit", className: "btn btn-success ms-auto", disabled: submittingComment || !newComment.trim(), children: "Post Comment" })] })] })] }), isStaff && (_jsx("div", { className: "col-md-4", children: _jsxs("div", { className: "card shadow-sm border-0 bg-light p-3 position-sticky", style: { top: '20px' }, children: [_jsx("h5", { className: "mb-3", children: "IT Operations" }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label fw-bold small text-muted text-uppercase", children: "Owner" }), _jsxs("div", { className: "d-flex align-items-center", children: [_jsx("span", { className: "me-2", children: ticket.owner?.name || 'Unassigned' }), !ticket.owner && _jsx("button", { className: "btn btn-sm btn-outline-primary", onClick: handleClaim, children: "Claim Ticket" })] })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label fw-bold small text-muted text-uppercase", children: "Status" }), _jsxs("select", { className: "form-select form-select-sm", value: ticket.currentStatus, onChange: handleStatusChange, children: [_jsx("option", { value: "New", children: "New" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Resolved", children: "Resolved" }), _jsx("option", { value: "Closed", children: "Closed" })] })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label fw-bold small text-muted text-uppercase", children: "IT Priority" }), _jsxs("select", { className: "form-select form-select-sm", value: ticket.itPriority || ticket.requestedPriority, onChange: handlePriorityChange, children: [_jsx("option", { value: "LOW", children: "LOW" }), _jsx("option", { value: "MEDIUM", children: "MEDIUM" }), _jsx("option", { value: "HIGH", children: "HIGH" }), _jsx("option", { value: "CRITICAL", children: "CRITICAL" })] })] })] }) }))] })] }));
};
