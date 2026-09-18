import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRequester } from '../context/RequesterContext.js';
export const CreateTicket = ({ onCancel }) => {
    const { selectedRequester } = useRequester();
    const [categories, setCategories] = useState([]);
    const [relatedSystems, setRelatedSystems] = useState([]);
    const [formData, setFormData] = useState({
        categoryId: '',
        relatedSystemId: '',
        summary: '',
        description: '',
        requestedPriority: 'MEDIUM'
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadFailures, setUploadFailures] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [ticketNumber, setTicketNumber] = useState('');
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [catRes, sysRes] = await Promise.all([
                    fetch('http://localhost:3000/api/categories'),
                    fetch('http://localhost:3000/api/related-systems')
                ]);
                if (catRes.ok)
                    setCategories(await catRes.json());
                if (sysRes.ok)
                    setRelatedSystems(await sysRes.json());
            }
            catch (err) {
                console.error('Failed to load dropdowns', err);
            }
        };
        fetchDropdowns();
    }, []);
    const handleFileChange = (e) => {
        if (!e.target.files)
            return;
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setErrors({ ...errors, attachments: 'Maximum 5 attachments allowed.' });
            e.target.value = '';
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        const invalidFile = files.find(f => !allowedTypes.includes(f.type));
        if (invalidFile) {
            setErrors({ ...errors, attachments: 'Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.' });
            e.target.value = '';
            return;
        }
        const oversizedFile = files.find(f => f.size > 5 * 1024 * 1024);
        if (oversizedFile) {
            setErrors({ ...errors, attachments: 'File too large. Maximum size is 5MB.' });
            e.target.value = '';
            return;
        }
        const newErrors = { ...errors };
        delete newErrors.attachments;
        setErrors(newErrors);
        setSelectedFiles(files);
    };
    const validate = () => {
        const newErrors = {};
        if (!formData.categoryId)
            newErrors.categoryId = 'Category is required';
        if (!formData.relatedSystemId)
            newErrors.relatedSystemId = 'Related system is required';
        if (!formData.summary.trim())
            newErrors.summary = 'Summary is required';
        if (formData.summary.length > 100)
            newErrors.summary = 'Summary must be 100 characters or less';
        if (!formData.description.trim())
            newErrors.description = 'Description is required';
        if (errors.attachments)
            newErrors.attachments = errors.attachments; // keep file error
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate())
            return;
        setIsSubmitting(true);
        setUploadFailures([]);
        try {
            const res = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requester-Id': selectedRequester?.id.toString() || ''
                },
                body: JSON.stringify(formData)
            });
            if (!res.ok)
                throw new Error('Failed to create ticket');
            const data = await res.json();
            const failures = [];
            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    const formDataObj = new FormData();
                    formDataObj.append('attachment', file);
                    try {
                        const uploadRes = await fetch(`http://localhost:3000/api/tickets/${data.id}/attachments`, {
                            method: 'POST',
                            headers: {
                                'X-Requester-Id': selectedRequester?.id.toString() || ''
                            },
                            body: formDataObj
                        });
                        if (!uploadRes.ok) {
                            const errData = await uploadRes.json().catch(() => ({}));
                            failures.push({ name: file.name, error: errData.error || 'Upload failed' });
                        }
                    }
                    catch (err) {
                        failures.push({ name: file.name, error: 'Network error' });
                    }
                }
            }
            setUploadFailures(failures);
            setSubmitSuccess(true);
            setTicketNumber(data.ticketNumber);
        }
        catch (err) {
            setErrors({ submit: 'An error occurred while creating the ticket.' });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (submitSuccess) {
        return (_jsx("div", { className: "card shadow-sm border-0 mt-4", children: _jsxs("div", { className: "card-body p-5 text-center", children: [_jsx("div", { className: "display-1 text-success mb-3", children: "\u2713" }), _jsx("h2", { style: { color: '#006B3C' }, children: "Ticket Created Successfully!" }), _jsx("p", { className: "text-muted", children: "Your IT Support ticket has been created." }), _jsx("div", { className: "alert mt-4 mb-4", style: { backgroundColor: '#EAF6EF', color: '#0B7A46', display: 'inline-block', fontSize: '1.25rem' }, children: _jsxs("strong", { children: ["Ticket #: ", ticketNumber] }) }), uploadFailures.length > 0 && (_jsxs("div", { className: "alert alert-warning text-start mx-auto", style: { maxWidth: '500px' }, children: [_jsx("strong", { children: "Note:" }), " The ticket was created, but some attachments failed to upload:", _jsx("ul", { className: "mb-0 mt-2", children: uploadFailures.map((f, i) => (_jsxs("li", { children: [f.name, ": ", f.error] }, i))) })] })), _jsxs("div", { children: [_jsx("button", { className: "btn btn-outline-secondary me-2", onClick: onCancel, children: "Back to Home" }), _jsx("button", { className: "btn", style: { backgroundColor: '#006B3C', color: 'white' }, onClick: () => {
                                    setSubmitSuccess(false);
                                    setFormData({ ...formData, summary: '', description: '' });
                                    setSelectedFiles([]);
                                    setUploadFailures([]);
                                }, children: "Create Another Ticket" })] })] }) }));
    }
    return (_jsxs("div", { className: "card shadow-sm border-0 mt-4", children: [_jsxs("div", { className: "card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-start", children: [_jsxs("div", { children: [_jsx("h2", { style: { color: '#006B3C' }, children: "Create IT Support Ticket" }), _jsx("p", { className: "text-muted mb-0", children: "Please provide details about your issue below." })] }), selectedRequester && (_jsx("div", { className: "text-end", children: _jsxs("span", { className: "badge", style: { backgroundColor: '#EAF6EF', color: '#0B7A46', fontSize: '0.9rem', padding: '0.5rem 0.8rem', border: '1px solid #c3e6cb' }, children: ["Requester: ", selectedRequester.name] }) }))] }), _jsxs("div", { className: "card-body p-4", children: [errors.submit && _jsx("div", { className: "alert alert-danger", children: errors.submit }), _jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [_jsxs("div", { className: "row mb-3", children: [_jsxs("div", { className: "col-md-6", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Category ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("select", { className: `form-select ${errors.categoryId ? 'is-invalid' : ''}`, value: formData.categoryId, onChange: e => setFormData({ ...formData, categoryId: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select Category..." }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] }), errors.categoryId && _jsx("div", { className: "invalid-feedback", children: errors.categoryId })] }), _jsxs("div", { className: "col-md-6", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Related System ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("select", { className: `form-select ${errors.relatedSystemId ? 'is-invalid' : ''}`, value: formData.relatedSystemId, onChange: e => setFormData({ ...formData, relatedSystemId: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select System..." }), relatedSystems.map(s => _jsx("option", { value: s.id, children: s.name }, s.id))] }), errors.relatedSystemId && _jsx("div", { className: "invalid-feedback", children: errors.relatedSystemId })] })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Summary ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { type: "text", className: `form-control ${errors.summary ? 'is-invalid' : ''}`, placeholder: "Brief summary of the issue (max 100 characters)", value: formData.summary, onChange: e => setFormData({ ...formData, summary: e.target.value }), maxLength: 100, required: true }), errors.summary && _jsx("div", { className: "invalid-feedback", children: errors.summary })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Description ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("textarea", { className: `form-control ${errors.description ? 'is-invalid' : ''}`, rows: 5, placeholder: "Detailed description of the problem, error messages, and steps to reproduce...", value: formData.description, onChange: e => setFormData({ ...formData, description: e.target.value }), required: true }), errors.description && _jsx("div", { className: "invalid-feedback", children: errors.description })] }), _jsxs("div", { className: "row mb-4", children: [_jsxs("div", { className: "col-md-6", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Requested Priority ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("select", { className: "form-select", value: formData.requestedPriority, onChange: e => setFormData({ ...formData, requestedPriority: e.target.value }), children: [_jsx("option", { value: "LOW", children: "Low - Not urgent, minor issue" }), _jsx("option", { value: "MEDIUM", children: "Medium - Normal issue, affects work" }), _jsx("option", { value: "HIGH", children: "High - Urgent, cannot work" })] })] }), _jsxs("div", { className: "col-md-6", children: [_jsx("label", { className: "form-label fw-bold", children: "Attachments" }), _jsx("input", { type: "file", className: `form-control ${errors.attachments ? 'is-invalid' : ''}`, multiple: true, accept: ".jpg,.jpeg,.png,.webp,.pdf", onChange: handleFileChange }), _jsx("div", { className: "form-text", children: "Max 5 files. Max size 5MB each. Supported formats: JPG, PNG, WEBP, PDF." }), errors.attachments && _jsx("div", { className: "invalid-feedback", children: errors.attachments })] })] }), _jsxs("div", { className: "d-flex justify-content-end gap-2 pt-3 border-top", children: [_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: onCancel, disabled: isSubmitting, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn", style: { backgroundColor: '#006B3C', color: 'white' }, disabled: isSubmitting, children: isSubmitting ? 'Submitting...' : 'Submit Ticket' })] })] })] })] }));
};
