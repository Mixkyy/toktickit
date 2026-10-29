import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';

export interface ActionTaken {
  id: number;
  ticketId: number;
  actionDate: string;
  description: string;
  result: string;
  performedById: number;
  performedBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  followUpRequired: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ActionsTakenSectionProps {
  ticketId: number;
  isStaff?: boolean;
}

export const ActionsTakenSection = ({ ticketId, isStaff }: ActionsTakenSectionProps) => {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create / Edit mode states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);

  // Form input states
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [attachmentNotes, setAttachmentNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/tickets/${ticketId}/actions`, {
        headers: {
          'X-Requester-Id': user ? String(user.id) : '',
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch actions taken');
      }
      const data = await res.json();
      setActions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Could not load actions taken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [ticketId]);

  const resetForm = () => {
    setDescription('');
    setResult('');
    setFollowUpRequired(false);
    setFollowUpNote('');
    setAttachmentNotes('');
    setFormError('');
    setEditingActionId(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (action: ActionTaken) => {
    setEditingActionId(action.id);
    setDescription(action.description);
    setResult(action.result);
    setFollowUpRequired(action.followUpRequired);
    setFollowUpNote(action.followUpNote || '');
    setAttachmentNotes(action.attachmentNotes || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!description.trim()) {
      setFormError('Action description is required.');
      return;
    }
    if (!result.trim()) {
      setFormError('Action result is required.');
      return;
    }
    if (followUpRequired && !followUpNote.trim()) {
      setFormError('Follow-up note is required when follow-up is needed.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        description: description.trim(),
        result: result.trim(),
        followUpRequired,
        followUpNote: followUpRequired ? followUpNote.trim() : null,
        attachmentNotes: attachmentNotes.trim() ? attachmentNotes.trim() : null,
      };

      const url = editingActionId
        ? `/api/tickets/${ticketId}/actions/${editingActionId}`
        : `/api/tickets/${ticketId}/actions`;
      const method = editingActionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Requester-Id': user ? String(user.id) : '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save action taken');
      }

      resetForm();
      await fetchActions();
    } catch (err: any) {
      setFormError(err.message || 'Error saving action taken');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="actions-taken-container my-4" data-testid="actions-taken-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 style={{ color: '#006B3C', margin: 0 }}>
            Actions Taken ({actions.length})
          </h4>
          <small className="text-muted">Formal record of service work performed</small>
        </div>
        {isStaff && !isFormOpen && (
          <button
            type="button"
            className="btn btn-sm btn-success"
            style={{ backgroundColor: '#006B3C', borderColor: '#006B3C' }}
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            data-testid="log-action-btn"
          >
            + Log Action Taken
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Form Mode (Create or Edit) */}
      {isStaff && isFormOpen && (
        <div
          className="card shadow-sm border-0 mb-4"
          style={{ backgroundColor: '#F5F7F6', borderLeft: '4px solid #006B3C' }}
          data-testid="action-form-card"
        >
          <div className="card-body p-4">
            <h5 style={{ color: '#006B3C' }} className="mb-3">
              {editingActionId ? 'Edit Action Taken' : 'New Action Taken'}
            </h5>

            {formError && (
              <div
                className="alert alert-danger py-2"
                style={{ color: '#842029', backgroundColor: '#f8d7da', borderColor: '#f5c2c7' }}
                data-testid="form-error-alert"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted" htmlFor="action-description">
                  Action Description <span className="text-danger">*</span>
                </label>
                <textarea
                  id="action-description"
                  className="form-control"
                  rows={3}
                  placeholder="Describe the action taken (e.g. replaced laptop battery, configured DNS)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-muted" htmlFor="action-result">
                  Result <span className="text-danger">*</span>
                </label>
                <textarea
                  id="action-result"
                  className="form-control"
                  rows={2}
                  placeholder="Outcome of the action (e.g. battery charges normally, network ping pass)..."
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="mb-3 p-3 bg-white rounded border">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="follow-up-check"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    disabled={submitting}
                  />
                  <label className="form-check-label fw-bold text-dark" htmlFor="follow-up-check">
                    Follow-Up Required?
                  </label>
                </div>

                {followUpRequired && (
                  <div className="mt-3">
                    <label className="form-label fw-bold small text-muted" htmlFor="follow-up-note">
                      Follow-up Note <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="follow-up-note"
                      className="form-control"
                      rows={2}
                      placeholder="Specify follow-up details and target date..."
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      disabled={submitting}
                      required={followUpRequired}
                    />
                    {!followUpNote.trim() && (
                      <div className="text-danger small mt-1" data-testid="followup-error-text">
                        Follow-up note is required when follow-up is needed.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-muted" htmlFor="attachment-notes">
                  Attachment Notes (Optional)
                </label>
                <input
                  type="text"
                  id="attachment-notes"
                  className="form-control"
                  placeholder="Reference relevant files or logs (e.g. diagnostics.pdf, screenshot)..."
                  value={attachmentNotes}
                  onChange={(e) => setAttachmentNotes(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-success"
                  style={{ backgroundColor: '#006B3C', borderColor: '#006B3C' }}
                  disabled={submitting}
                  data-testid="save-action-btn"
                >
                  {submitting ? 'Saving...' : editingActionId ? 'Update Action' : 'Save Action Taken'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Mode */}
      {loading ? (
        <div className="text-muted p-3 text-center">Loading actions taken...</div>
      ) : actions.length === 0 ? (
        <div
          className="p-4 text-center rounded border"
          style={{ backgroundColor: '#F5F7F6', color: '#6c757d' }}
          data-testid="no-actions-msg"
        >
          <em>No actions taken recorded yet.</em>
        </div>
      ) : (
        <div className="actions-list d-flex flex-column gap-3" data-testid="actions-list">
          {actions.map((act) => (
            <div
              key={act.id}
              className="card border shadow-sm"
              style={{
                borderLeft: '4px solid #0B7A46',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
              }}
              data-testid={`action-card-${act.id}`}
            >
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong style={{ color: '#006B3C' }}>
                      {act.performedBy?.name || 'IT Staff'}
                    </strong>
                    <span className="badge bg-secondary ms-2 small">
                      {act.performedBy?.role || 'IT_STAFF'}
                    </span>
                    <span className="text-muted ms-2 small">
                      &bull; {new Date(act.actionDate).toLocaleString()}
                    </span>
                  </div>
                  {isStaff && !isFormOpen && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none"
                      style={{ color: '#0B7A46' }}
                      onClick={() => handleStartEdit(act)}
                      data-testid={`edit-action-btn-${act.id}`}
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="mb-2">
                  <div className="small text-muted fw-bold text-uppercase">Description</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{act.description}</div>
                </div>

                <div className="mb-2">
                  <div className="small text-muted fw-bold text-uppercase">Result</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{act.result}</div>
                </div>

                {act.followUpRequired ? (
                  <div
                    className="p-2 rounded mb-2"
                    style={{
                      backgroundColor: '#FFF3CD',
                      border: '1px solid #FFE69C',
                      color: '#664D03',
                    }}
                    data-testid="follow-up-banner"
                  >
                    <strong>Follow-up Required: </strong>
                    <span>{act.followUpNote || 'Follow-up pending'}</span>
                  </div>
                ) : (
                  <div className="small text-success mb-2">&bull; No follow-up needed</div>
                )}

                {act.attachmentNotes && (
                  <div className="small text-muted">
                    <strong>Attachment Notes: </strong> {act.attachmentNotes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
