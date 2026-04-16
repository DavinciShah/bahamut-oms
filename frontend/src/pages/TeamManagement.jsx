import { useState, useEffect } from 'react';
import tenantService from '../services/tenantService';

export default function TeamManagement() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    tenantService.getTeam()
      .then(res => setTeam(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setError('');
    setSuccess('');
    try {
      await tenantService.inviteUser(inviteForm);
      setSuccess(`Invitation sent to ${inviteForm.email}`);
      setInviteForm({ email: '', role: 'member' });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this team member?')) return;
    try {
      await tenantService.removeTeamMember(id);
      setTeam(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Failed to remove: ' + err.message);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await tenantService.updateTeamMember(id, { role });
      setTeam(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const roleColors = { owner: '#fef9c3', admin: '#dbeafe', manager: '#f3e8ff', member: '#f1f5f9' };
  const inputStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Team Management</h2>

      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Invite Team Member</h3>
        {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 14 }}>{error}</div>}
        {success && <div style={{ color: '#16a34a', marginBottom: 12, fontSize: 14 }}>{success}</div>}
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="email" required value={inviteForm.email}
            onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
            placeholder="colleague@company.com" style={{ ...inputStyle, minWidth: 240 }}
          />
          <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))} style={inputStyle}>
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={inviting} style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {inviting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Member', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
            ) : team.map(member => (
              <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
                      {(member.name || member.email || '?')[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{member.name || '-'}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 14 }}>{member.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  {member.role === 'owner' ? (
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: roleColors.owner }}>Owner</span>
                  ) : (
                    <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, background: roleColors[member.role] || '#f1f5f9' }}>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                    </select>
                  )}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '10px 14px' }}>
                  {member.role !== 'owner' && (
                    <button onClick={() => handleRemove(member.id)}
                      style={{ padding: '4px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && team.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No team members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
