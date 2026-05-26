import React, { useEffect, useState } from 'react';
import { Plus, Pencil, UserCheck, UserX } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Select, Table, Spinner } from '../../components/ui';

const ROLES = ['user', 'council_member', 'secretary', 'coordinator', 'admin'];

const ROLE_LABELS = {
  '': 'Todos',
  user: 'Utilizador',
  council_member: 'Membro do Conselho',
  secretary: 'Secretário/a',
  coordinator: 'Coordenador',
  admin: 'Administrador'
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  const userRole = api.currentUser?.role;
  const isAdmin = userRole === 'admin';

  const allowedRolesForSelect = isAdmin 
    ? ROLES 
    : ROLES.filter(r => r !== 'admin' && r !== 'coordinator');

  const load = () => api.getUsers().then(d => { setUsers(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { 
    setForm({ name: '', email: '', password: '', role: allowedRolesForSelect[0] || 'user' }); 
    setCreateOpen(true); 
  };
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: '', role: u.role }); setEditUser(u); };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.createUser(form); } catch(err) { alert(err.message); }
    setSaving(false); setCreateOpen(false); load();
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.updateUser(editUser.id, { name: form.name, email: form.email, role: form.role });
      setEditUser(null);
    } catch(err) {
      alert(err.message);
    }
    setSaving(false); load();
  };

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUserStatus(u.id, next);
    } catch(err) {
      alert(err.message);
    }
    load();
  };

  const filtered = users.filter(u => !roleFilter || u.role === roleFilter);

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Utilizadores"
        subtitle="Gerir contas e funções dos membros"
        action={<Btn onClick={openCreate}><Plus size={16} /> Novo Utilizador</Btn>}
      />

      {/* Role filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', ...ROLES].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${roleFilter === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            {ROLE_LABELS[r] || r}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['Utilizador', 'Email', 'Função', 'Data de Registo', 'Estado', 'Ações']}>
          {filtered.map(u => (
            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(u.name || '?').charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-800">{u.name || 'Unknown'}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500 text-sm">{u.email}</td>
              <td className="px-4 py-3"><Badge status={u.role} /></td>
              <td className="px-4 py-3 text-slate-500 text-sm whitespace-nowrap">{u.joined}</td>
              <td className="px-4 py-3"><Badge status={u.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {(isAdmin || (u.role !== 'admin' && u.role !== 'coordinator')) ? (
                    <>
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(u)}><Pencil size={14} /></Btn>
                      <Btn
                        variant={u.status === 'active' ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => toggleStatus(u)}
                      >
                        {u.status === 'active' ? <><UserX size={14} /> Desativar</> : <><UserCheck size={14} /> Ativar</>}
                      </Btn>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">Protegido</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Utilizador">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Nome Completo"><Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" /></FormField>
          <FormField label="Email"><Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@ecogest.pt" /></FormField>
          <FormField label="Palavra-passe"><Input required type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" /></FormField>
          <FormField label="Função">
            <Select value={form.role} onChange={e => set('role', e.target.value)}>
              {allowedRolesForSelect.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'A criar…' : 'Criar Utilizador'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Editar — ${editUser?.name}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          <FormField label="Nome Completo"><Input required value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
          <FormField label="Email"><Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} /></FormField>
          <FormField label="Função">
            <Select value={form.role} onChange={e => set('role', e.target.value)}>
              {allowedRolesForSelect.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setEditUser(null)}>Cancelar</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'A guardar…' : 'Guardar Alterações'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
