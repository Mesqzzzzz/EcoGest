import React, { useEffect, useState } from 'react';
import { Plus, ArrowRightCircle } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Select, Table, Spinner } from '../../components/ui';

const LEVELS = ['bronze', 'silver', 'gold'];
const STATUS_TRANSITIONS = { planning: ['active'], active: ['finished'], finished: [] };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear(), level: 'gold' });
  const [saving, setSaving] = useState(false);

  const load = () => api.getProjects().then(d => { setProjects(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await api.createProject(form);
    setSaving(false);
    setCreateOpen(false);
    setForm({ name: '', year: new Date().getFullYear(), level: 'gold' });
    load();
  };

  const advanceStatus = async (project) => {
    const next = STATUS_TRANSITIONS[project.status]?.[0];
    if (!next) return;
    await api.updateProjectStatus(project.id, next);
    load();
  };

  const coordinatorName = (id) => {
    const u = api.users.find(u => u.id === id);
    return u ? u.name : '—';
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Projects"
        subtitle="Manage yearly eco-school projects"
        action={<Btn onClick={() => setCreateOpen(true)}><Plus size={16} /> New Project</Btn>}
      />

      {loading ? <Spinner /> : (
        <Table headers={['Project', 'Year', 'Level', 'Coordinator', 'Status', 'Actions']}>
          {projects.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
              <td className="px-4 py-3 text-slate-600">{p.year}</td>
              <td className="px-4 py-3"><Badge status={p.level} /></td>
              <td className="px-4 py-3 text-slate-600">{coordinatorName(p.coordinator_id)}</td>
              <td className="px-4 py-3"><Badge status={p.status} /></td>
              <td className="px-4 py-3">
                {STATUS_TRANSITIONS[p.status]?.length > 0 && (
                  <Btn variant="ghost" size="sm" onClick={() => advanceStatus(p)}>
                    <ArrowRightCircle size={14} /> Advance to {STATUS_TRANSITIONS[p.status][0]}
                  </Btn>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Project Name"><Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Eco Schools 2027" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Year"><Input type="number" required value={form.year} onChange={e => set('year', parseInt(e.target.value))} min={2020} max={2040} /></FormField>
            <FormField label="Certification Level">
              <Select value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Project'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
