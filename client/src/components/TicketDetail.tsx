import { useState, useEffect, useRef } from "react";
import { useRequester } from "../context/RequesterContext.js";

interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface TicketDetailData {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: string;
  currentStatus: string;
  createdAt: string;
  category: { name: string };
  relatedSystem: { name: string };
  attachments: Attachment[];
}

export function TicketDetail({ ticketId, onBack }: { ticketId: number, onBack: () => void }) {
  const { selectedRequester } = useRequester();
  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTicket = async () => {
    if (!selectedRequester) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        headers: { 'X-Requester-Id': String(selectedRequester.id) }
      });
      if (!res.ok) throw new Error("Failed to load ticket details");
      const data = await res.json();
      setTicket(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId, selectedRequester]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRequester) return;

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
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachmentId: number, fileName: string) => {
    if (!selectedRequester) return;
    try {
      const res = await fetch(`http://localhost:3000/api/attachments/${attachmentId}/download`, {
        headers: { 'X-Requester-Id': String(selectedRequester.id) }
      });
      if (!res.ok) throw new Error("Failed to download");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Could not download file.");
    }
  };

  const handleRemove = async (attachmentId: number) => {
    if (!selectedRequester) return;
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
      
      if (!res.ok) throw new Error("Failed to remove");
      await fetchTicket(); // Refresh list
    } catch (err) {
      alert("Could not remove attachment.");
    }
  };

  if (loading) return <div className="text-center p-5">Loading ticket details...</div>;
  if (error || !ticket) return <div className="alert alert-danger">{error || "Ticket not found"}</div>;

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
        <div>
          <button className="btn btn-link btn-sm p-0 text-decoration-none text-muted mb-2" onClick={onBack}>
            &larr; Back to My Tickets
          </button>
          <h2 style={{ color: '#006B3C' }}>{ticket.ticketNumber}</h2>
          <p className="text-muted mb-0">{ticket.summary}</p>
        </div>
        <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">{ticket.currentStatus}</span>
      </div>

      <div className="card-body p-4">
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="small text-muted fw-bold text-uppercase">Category</div>
            <div>{ticket.category.name}</div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="small text-muted fw-bold text-uppercase">Related System</div>
            <div>{ticket.relatedSystem.name}</div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="small text-muted fw-bold text-uppercase">Priority</div>
            <div>{ticket.requestedPriority}</div>
          </div>
          <div className="col-md-12 mb-3 mt-3">
            <div className="small text-muted fw-bold text-uppercase mb-2">Description</div>
            <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <h4 style={{ color: '#006B3C' }} className="mb-3">Attachments ({ticket.attachments.length}/5)</h4>
        
        {ticket.attachments.length > 0 ? (
          <ul className="list-group mb-4">
            {ticket.attachments.map(att => (
              <li key={att.id} className="list-group-item d-flex justify-content-between align-items-center bg-light border-0 mb-2 rounded">
                <div>
                  <strong>{att.fileName}</strong> <br/>
                  <small className="text-muted">{(att.fileSize / 1024).toFixed(1)} KB &bull; Uploaded {new Date(att.createdAt).toLocaleDateString()}</small>
                </div>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleDownload(att.id, att.fileName)}>Download</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(att.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted fst-italic">No active attachments for this ticket.</p>
        )}

        {ticket.attachments.length < 5 && (
          <div className="p-3 rounded border" style={{ backgroundColor: '#F5F7F6' }}>
            <label className="form-label fw-bold small text-muted">Upload New Attachment</label>
            <input 
              type="file" 
              className="form-control" 
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleUpload}
              disabled={uploading}
            />
            <div className="form-text">Max 5MB. JPG, PNG, WEBP, or PDF.</div>
            {uploading && <div className="text-primary mt-2 small">Uploading...</div>}
          </div>
        )}
      </div>
    </div>
  );
}
