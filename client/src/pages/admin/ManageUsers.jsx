import React, { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, updateUserApi } from '../../api/admin.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const ManageUsers = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    status: 'active'
  });
  const [createErrors, setCreateErrors] = useState({});
  const [savingCreate, setSavingCreate] = useState(false);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'Student',
    status: 'active',
    password: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsersApi();
      setUsers(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch user list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!createForm.name.trim()) errors.name = 'Full name is required.';
    if (!createForm.email.trim()) errors.email = 'Email address is required.';
    if (!createForm.password || createForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setSavingCreate(true);
    try {
      await createUserApi(createForm);
      showToast('User created successfully.', 'success');
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'Student', status: 'active' });
      setCreateErrors({});
      await loadUsers();
    } catch (err) {
      if (err.details) setCreateErrors(err.details);
      showToast(err.message || 'Failed to create user.', 'error');
    } finally {
      setSavingCreate(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.Name,
      email: user.Email,
      role: user.Role,
      status: user.Status,
      password: ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    try {
      await updateUserApi(editingUser.UserID, editForm);
      showToast('User updated successfully.', 'success');
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleUserStatus = async (user) => {
    const nextStatus = user.Status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserApi(user.UserID, { status: nextStatus });
      showToast(`User status set to ${nextStatus}.`, 'success');
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-description">
            Administer platform accounts across all roles (Student, Industry Partner, Coordinator, Administrator).
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create New User
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading user directory..." />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name & Email</th>
                <th>Platform Role</th>
                <th>Associated Profile</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.UserID}>
                  <td>#{u.UserID}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.Name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.Email}</div>
                  </td>
                  <td>
                    <span className="badge badge-default">{u.Role}</span>
                  </td>
                  <td>
                    {u.studentProfile && (
                      <span style={{ fontSize: '12px' }}>
                        Program: <strong>{u.studentProfile.AcademicProgram}</strong>
                      </span>
                    )}
                    {u.companyProfile && (
                      <span style={{ fontSize: '12px' }}>
                        Company: <strong>{u.companyProfile.CompanyName}</strong> ({u.companyProfile.VerificationStatus})
                      </span>
                    )}
                    {!u.studentProfile && !u.companyProfile && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <Badge status={u.Status} />
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(u)}
                      >
                        Edit
                      </button>
                      <button
                        className={`btn btn-sm ${u.Status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleUserStatus(u)}
                      >
                        {u.Status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Platform User"
      >
        <form onSubmit={handleCreateSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className={`form-control ${createErrors.name ? 'is-invalid' : ''}`}
            />
            {createErrors.name && <span className="form-error-msg">{createErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className={`form-control ${createErrors.email ? 'is-invalid' : ''}`}
            />
            {createErrors.email && <span className="form-error-msg">{createErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required-star">*</span>
            </label>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className={`form-control ${createErrors.password ? 'is-invalid' : ''}`}
            />
            {createErrors.password && <span className="form-error-msg">{createErrors.password}</span>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="form-control"
              >
                <option value="Student">Student</option>
                <option value="IndustryPartner">IndustryPartner</option>
                <option value="OJTCoordinator">OJTCoordinator</option>
                <option value="SchoolAdministrator">SchoolAdministrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="form-control"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingCreate}>
              {savingCreate ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit User: #${editingUser?.UserID} ${editingUser?.Name}`}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="form-control"
              >
                <option value="Student">Student</option>
                <option value="IndustryPartner">IndustryPartner</option>
                <option value="OJTCoordinator">OJTCoordinator</option>
                <option value="SchoolAdministrator">SchoolAdministrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="form-control"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reset Password (Leave blank to keep current)</label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder="Enter new password to reset"
              className="form-control"
            />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingEdit}>
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
