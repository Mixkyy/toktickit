import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useRequester } from "../context/RequesterContext.js";
export function TicketDetail({ ticketId, onBack }) {
    const { selectedRequester } = useRequester();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const fetchTicket = async () => {
        if (!selectedRequester)
            return;
        try {
            const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
                headers: { 'X-Requester-Id': String(selectedRequester.id) }
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
    useEffect(() => {
        fetchTicket();
    }, [ticketId, selectedRequester]);
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedRequester)
            return;
        if (file.size > 5 * 1024 * 1024) {
            alert("File size exceeds 5MB limit");
            return;
        }
        const formData = new FormData();
        formData.append("attachment", file);
        setUploading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}/attachments`, {
                method: "POST",
                headers: { 'X-Requester-Id': String(selectedRequester.id) },
                body: formData
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Upload failed");
            }
            // Refresh ticket to show new attachment
            await fetchTicket();
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
        catch (err) {
            alert(err.message);
        }
        finally {
            setUploading(false);
        }
    };
    const handleDownload = async (attachmentId, fileName) => {
        if (!selectedRequester)
            return;
        try {
            const res = await fetch(`http://localhost:3000/api/attachments/${attachmentId}/download`, {
                headers: { 'X-Requester-Id': String(selectedRequester.id) }
            });
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
        if (!selectedRequester)
            return;
        const reason = window.prompt("Please provide a reason for removing this attachment:");
        if (!reason || reason.trim() === "") {
            alert("A reason is required to remove an attachment.");
            return;
        }
        try {
            const res = await fetch(`http://localhost:3000/api/attachments/${attachmentId}`, {
                method: "DELETE",
                headers: {
                    'X-Requester-Id': String(selectedRequester.id),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            if (!res.ok)
                throw new Error("Failed to remove");
            await fetchTicket(); // Refresh list
        }
        catch (err) {
            alert("Could not remove attachment.");
        }
    };
    if (loading)
        return _jsx("div", { className: "text-center p-5", children: "Loading ticket details..." });
    if (error || !ticket)
        return _jsx("div", { className: "alert alert-danger", children: error || "Ticket not found" });
    return (_jsxs("div", { className: "card shadow-sm border-0 mt-4", children: [_jsxs("div", { className: "card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsx("button", { className: "btn btn-link btn-sm p-0 text-decoration-none text-muted mb-2", onClick: onBack, children: "\u2190 Back to My Tickets" }), _jsx("h2", { style: { color: '#006B3C' }, children: ticket.ticketNumber }), _jsx("p", { className: "text-muted mb-0", children: ticket.summary })] }), _jsx("span", { className: "badge bg-primary px-3 py-2 fs-6 rounded-pill", children: ticket.currentStatus })] }), _jsxs("div", { className: "card-body p-4", children: [_jsxs("div", { className: "row mb-4", children: [_jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("div", { className: "small text-muted fw-bold text-uppercase", children: "Category" }), _jsx("div", { children: ticket.category.name })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("div", { className: "small text-muted fw-bold text-uppercase", children: "Related System" }), _jsx("div", { children: ticket.relatedSystem.name })] }), _jsxs("div", { className: "col-md-4 mb-3", children: [_jsx("div", { className: "small text-muted fw-bold text-uppercase", children: "Priority" }), _jsx("div", { children: ticket.requestedPriority })] }), _jsxs("div", { className: "col-md-12 mb-3 mt-3", children: [_jsx("div", { className: "small text-muted fw-bold text-uppercase mb-2", children: "Description" }), _jsx("div", { className: "p-3 bg-light rounded", style: { whiteSpace: 'pre-wrap' }, children: ticket.description })] })] }), _jsx("hr", { className: "my-4" }), _jsxs("h4", { style: { color: '#006B3C' }, className: "mb-3", children: ["Attachments (", ticket.attachments.length, "/5)"] }), ticket.attachments.length > 0 ? (_jsx("ul", { className: "list-group mb-4", children: ticket.attachments.map(att => (_jsxs("li", { className: "list-group-item d-flex justify-content-between align-items-center bg-light border-0 mb-2 rounded", children: [_jsxs("div", { children: [_jsx("strong", { children: att.fileName }), " ", _jsx("br", {}), _jsxs("small", { className: "text-muted", children: [(att.fileSize / 1024).toFixed(1), " KB \u2022 Uploaded ", new Date(att.createdAt).toLocaleDateString()] })] }), _jsxs("div", { children: [_jsx("button", { className: "btn btn-sm btn-outline-primary me-2", onClick: () => handleDownload(att.id, att.fileName), children: "Download" }), _jsx("button", { className: "btn btn-sm btn-outline-danger", onClick: () => handleRemove(att.id), children: "Remove" })] })] }, att.id))) })) : (_jsx("p", { className: "text-muted fst-italic", children: "No active attachments for this ticket." })), ticket.attachments.length < 5 && (_jsxs("div", { className: "p-3 rounded border", style: { backgroundColor: '#F5F7F6' }, children: [_jsx("label", { className: "form-label fw-bold small text-muted", children: "Upload New Attachment" }), _jsx("input", { type: "file", className: "form-control", ref: fileInputRef, accept: ".jpg,.jpeg,.png,.webp,.pdf", onChange: handleUpload, disabled: uploading }), _jsx("div", { className: "form-text", children: "Max 5MB. JPG, PNG, WEBP, or PDF." }), uploading && _jsx("div", { className: "text-primary mt-2 small", children: "Uploading..." })] }))] })] }));
}
