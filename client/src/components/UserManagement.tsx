import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  requiresPasswordChange: boolean;
  createdAt: string;
}

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
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
      if (search) query.append("search", search);
      if (roleFilter) query.append("role", roleFilter);
      
      const res = await fetch(`/api/users?${query.toString()}`, {
        headers: {  }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
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

  const handleOpenEdit = (user: User) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUserId 
        ? `/api/users/${editingUserId}`
        : `/api/users`;
        
      const payload = { ...formData };
      if (editingUserId && payload.initialPassword) {
        (payload as any).newInitialPassword = payload.initialPassword;
        delete (payload as any).initialPassword;
      }
      if (editingUserId && !payload.initialPassword && !(payload as any).newInitialPassword) {
        delete (payload as any).initialPassword;
        delete (payload as any).newInitialPassword;
      }

      const res = await fetch(url, {
        method: editingUserId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to save user");
        return;
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert("An error occurred");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#006B3C' }}>User Management</h2>
        <button className="btn btn-success" onClick={handleOpenCreate}>+ Create User</button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3 bg-light rounded d-flex gap-3">
          <input 
            type="text" 
            className="form-control w-50" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="form-select w-25" 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="REQUESTER">Requester</option>
            <option value="IT_STAFF">IT Staff</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading users...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="fw-bold">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMINISTRATOR' ? 'bg-danger' : u.role === 'IT_STAFF' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenEdit(u)}>Edit</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4 text-muted fst-italic">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header text-white" style={{ backgroundColor: '#006B3C' }}>
                <h5 className="modal-title">{editingUserId ? 'Edit User' : 'Create New User'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Full Name *</label>
                    <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Email Address *</label>
                    <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Role *</label>
                    <select className="form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="REQUESTER">Requester</option>
                      <option value="IT_STAFF">IT Staff</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                      <label className="form-check-label fw-bold small text-muted">Account Active</label>
                    </div>
                  </div>

                  <div className="p-3 bg-light border rounded">
                    <label className="form-label fw-bold small text-muted">
                      {editingUserId ? 'Set New Initial Password (Optional)' : 'Initial Password *'}
                    </label>
                    <input 
                      type="text" 
                      className="form-control mb-2" 
                      value={formData.initialPassword} 
                      onChange={e => setFormData({...formData, initialPassword: e.target.value})} 
                      required={!editingUserId} 
                    />
                    <div className="form-text small">
                      <i className="bi bi-info-circle text-primary"></i> User will be forced to change this password on their next login.
                    </div>
                  </div>

                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success text-white" style={{ backgroundColor: '#006B3C' }}>Save User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
