import React, { useEffect, useState } from 'react';
import { Plus, Pencil, UserCheck, UserX } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Select, Table, Spinner } from '../../components/ui';

const ROLES = ['user', 'council_member', 'secretary', 'coordinator', 'admin'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  const load = () => api.getUsers().then(d => { setUsers(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm({ name: '', email: '', password: '', role: 'user' }); setCreateOpen(true); };
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: '', role: u.role }); setEditUser(u); };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.createUser(form); } catch(err) { alert(err.message); }
    setSaving(false); setCreateOpen(false); load();
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    await api.updateUser(editUser.id, { name: form.name, email: form.email, role: form.role });
    setSaving(false); setEditUser(null); load();
  };

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'inactive' : 'active';
    await api.updateUserStatus(u.id, next);
    load();
  };

  const filtered = users.filter(u => !roleFilter || u.role === roleFilter);

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Users"
        subtitle="Manage member accounts and roles"
        action={<Btn onClick={openCreate}><Plus size={16} /> New User</Btn>}
      />

      {/* Role filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', ...ROLES].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${roleFilter === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            {r || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['User', 'Email', 'Role', 'Joined', 'Status', 'Actions']}>
          {filtered.map(u => (
            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-800">{u.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500 text-sm">{u.email}</td>
              <td className="px-4 py-3"><Badge status={u.role} /></td>
              <td className="px-4 py-3 text-slate-500 text-sm whitespace-nowrap">{u.joined}</td>
              <td className="px-4 py-3"><Badge status={u.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Btn variant="ghost" size="sm" onClick={() => openEdit(u)}><Pencil size={14} /></Btn>
                  <Btn
                    variant={u.status === 'active' ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => toggleStatus(u)}
                  >
                    {u.status === 'active' ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                  </Btn>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Full Name"><Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" /></FormField>
          <FormField label="Email"><Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@ecogest.pt" /></FormField>
          <FormField label="Password"><Input required type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" /></FormField>
          <FormField label="Role">
            <Select value={form.role} onChange={e => set('role', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create User'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit — ${editUser?.name}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          <FormField label="Full Name"><Input required value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
          <FormField label="Email"><Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
          <FormField label="Role">
            <Select value={form.role} onChange={e => set('role', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setEditUser(null)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
