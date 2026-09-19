import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.js";

interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  createdAt: string;
  isRemoved: boolean;
  removedReason?: string;
}

interface TicketDetailData {
  id: number;
  ticketNumber: string;
  summary: string;
  description: string;
  requestedPriority: string;
  itPriority?: string;
  currentStatus: string;
  createdAt: string;
  category: { name: string };
  relatedSystem: { name: string };
  owner?: { id: number; name: string };
  attachments: Attachment[];
}

interface CommentData {
  id: number;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: { id: number; name: string; role: string };
}

export const TicketDetail = ({ ticketId, isStaff, onBack }: { ticketId: number, isStaff?: boolean, onBack: () => void }) => {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTicket = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        headers: { 'X-Requester-Id': String(user.id) }
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

  const fetchComments = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        // Fallback for UI mock:
        headers: {  }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [ticketId, user]);

  const updateTicket = async (field: string, value: string | number | null) => {
    try {
      const res = await fetch(`/api/staff/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        fetchTicket(); // refresh data
      }
    } catch (err) {
      alert("Failed to update ticket.");
    }
  };

  const handleClaim = () => {
    if (!user) return;
    updateTicket('ownerId', user.id);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateTicket('currentStatus', e.target.value);
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateTicket('itPriority', e.target.value);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, isInternal })
      });
      if (res.ok) {
        setNewComment("");
        setIsInternal(false);
        fetchComments();
      } else {
        alert("Failed to post comment.");
      }
    } catch (err) {
      alert("Error posting comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) return alert("File size exceeds 5MB limit");
    
    const formData = new FormData();
    formData.append("attachment", file);
    setUploading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: "POST", headers: { 'X-Requester-Id': String(user.id) }, body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      await fetchTicket();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  };

  const handleDownload = async (attachmentId: number, fileName: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/attachments/${attachmentId}/download`, { headers: { 'X-Requester-Id': String(user.id) }});
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (err) { alert("Could not download file."); }
  };

  const handleRemove = async (attachmentId: number) => {
    if (!user) return;
    const reason = window.prompt("Reason for removal:");
    if (!reason || reason.trim() === "") return alert("Reason required.");
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE", headers: { 'X-Requester-Id': String(user.id), 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error("Failed to remove");
      await fetchTicket();
    } catch (err) { alert("Could not remove attachment."); }
  };

  if (loading) return <div className="text-center p-5">Loading ticket details...</div>;
  if (error || !ticket) return <div className="alert alert-danger">{error || "Ticket not found"}</div>;

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
        <div>
          <button className="btn btn-link btn-sm p-0 text-decoration-none text-muted mb-2" onClick={onBack}>
            &larr; Back to {isStaff ? "Queue" : "My Tickets"}
          </button>
          <h2 style={{ color: '#006B3C' }}>{ticket.ticketNumber}</h2>
          <p className="text-muted mb-0">{ticket.summary}</p>
        </div>
        <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">{ticket.currentStatus}</span>
      </div>

      <div className="card-body p-4 row">
        <div className={isStaff ? "col-md-8" : "col-12"}>
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
              <div>{ticket.itPriority || ticket.requestedPriority}</div>
            </div>
            <div className="col-md-12 mb-3 mt-3">
              <div className="small text-muted fw-bold text-uppercase mb-2">Description</div>
              <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
            </div>
          </div>

          <hr className="my-4" />
          <h4 style={{ color: '#006B3C' }} className="mb-3">Attachments ({ticket.attachments.length}/5)</h4>
          {ticket.attachments.length > 0 ? (
            <ul className="list-group mb-4">
              {ticket.attachments.map(att => (
                <li key={att.id} className={`list-group-item d-flex justify-content-between align-items-center border-0 mb-2 rounded ${att.isRemoved ? 'bg-white border' : 'bg-light'}`}>
                  <div>
                    <strong className={att.isRemoved ? 'text-decoration-line-through text-muted' : ''}>{att.fileName}</strong> 
                    {att.isRemoved && <span className="badge bg-danger ms-2">Removed</span>}
                    <br/><small className="text-muted">{(att.fileSize / 1024).toFixed(1)} KB &bull; Uploaded {new Date(att.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div>
                    {!att.isRemoved ? (
                      <><button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleDownload(att.id, att.fileName)}>Download</button><button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(att.id)}>Remove</button></>
                    ) : <button className="btn btn-sm btn-secondary" disabled>Unavailable</button>}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted fst-italic">No active attachments.</p>}

          {ticket.attachments.filter(a => !a.isRemoved).length < 5 && (
            <div className="p-3 rounded border mb-4" style={{ backgroundColor: '#F5F7F6' }}>
              <label className="form-label fw-bold small text-muted">Upload New Attachment</label>
              <input type="file" className="form-control" ref={fileInputRef} accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleUpload} disabled={uploading}/>
              <div className="form-text">Max 5MB. JPG, PNG, WEBP, or PDF.</div>
            </div>
          )}
          
          <hr className="my-4" />
          
          <h4 style={{ color: '#006B3C' }} className="mb-3">Discussion</h4>
          <div className="comments-feed mb-4">
            {comments.map(c => (
              <div key={c.id} className={`card mb-3 border-0 shadow-sm ${c.isInternal ? 'bg-warning bg-opacity-10' : 'bg-light'}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <strong>{c.author.name} <span className="badge bg-secondary ms-1">{c.author.role}</span></strong>
                    <small className="text-muted">{new Date(c.createdAt).toLocaleString()}</small>
                  </div>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{c.content}</p>
                  {c.isInternal && <span className="badge bg-warning text-dark mt-2">Internal Note</span>}
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-muted fst-italic">No comments yet.</p>}
          </div>

          {!isStaff && ticket.currentStatus !== 'Resolved' && ticket.currentStatus !== 'Closed' && (
            <div className="mb-4">
              <button 
                className="btn btn-outline-success"
                onClick={async () => {
                  if (window.confirm("Mark this problem as apparently resolved?")) {
                    setSubmittingComment(true);
                    try {
                      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: "The requester has indicated that the problem appears to be resolved.", isInternal: false })
                      });
                      if (res.ok) fetchComments();
                    } finally {
                      setSubmittingComment(false);
                    }
                  }
                }}
              >
                Problem Appears Resolved
              </button>
            </div>
          )}

          <form onSubmit={submitComment} className="p-3 bg-light rounded border">
            <div className="mb-2">
              <textarea className="form-control" rows={3} placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} required></textarea>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              {isStaff && (
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="isInternal" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                  <label className="form-check-label fw-bold text-warning" htmlFor="isInternal">Make Internal Note</label>
                </div>
              )}
              <button type="submit" className="btn btn-success ms-auto" disabled={submittingComment || !newComment.trim()}>Post Comment</button>
            </div>
          </form>

        </div>
        
        {isStaff && (
          <div className="col-md-4">
            <div className="card shadow-sm border-0 bg-light p-3 position-sticky" style={{ top: '20px' }}>
              <h5 className="mb-3">IT Operations</h5>
              
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted text-uppercase">Owner</label>
                <div className="d-flex align-items-center">
                  <span className="me-2">{ticket.owner?.name || 'Unassigned'}</span>
                  {!ticket.owner && <button className="btn btn-sm btn-outline-primary" onClick={handleClaim}>Claim Ticket</button>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-muted text-uppercase">Status</label>
                <select className="form-select form-select-sm" value={ticket.currentStatus} onChange={handleStatusChange}>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-muted text-uppercase">IT Priority</label>
                <select className="form-select form-select-sm" value={ticket.itPriority || ticket.requestedPriority} onChange={handlePriorityChange}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
