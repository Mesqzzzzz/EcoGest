import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Users, Check, Clock, X } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Textarea, Select, Table, Spinner } from '../../components/ui';

const AREAS = ['Environment', 'Biodiversity', 'Energy', 'Waste', 'Water', 'Food', 'Transport'];
const STATUSES = ['planned', 'active', 'completed'];

function ActivityForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', description: '', date: '', location: '', area: 'Environment', status: 'planned' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Name"><Input required value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
      <FormField label="Description"><Textarea value={form.description} onChange={e => set('description', e.target.value)} /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date"><Input type="date" required value={form.date} onChange={e => set('date', e.target.value)} /></FormField>
        <FormField label="Area">
          <Select value={form.area} onChange={e => set('area', e.target.value)}>
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </Select>
        </FormField>
      </div>
      <FormField label="Location"><Input value={form.location} onChange={e => set('location', e.target.value)} /></FormField>
      {initial && (
        <FormField label="Status">
          <Select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </Select>
        </FormField>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : (initial ? 'Save Changes' : 'Create Activity')}</Btn>
      </div>
    </form>
  );
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | {id, ...}
  const [participantsModal, setParticipantsModal] = useState(null);
  const [participants, setParticipants] = useState([]);

  const load = () => api.adminGetActivities(filterStatus ? { status: filterStatus } : {}).then(d => { setActivities(d); setLoading(false); });
  useEffect(() => { load(); }, [filterStatus]);

  const openParticipants = async (act) => {
    const p = await api.getParticipants(act.id);
    setParticipants(p);
    setParticipantsModal(act);
  };

  const handleCreate = async (form) => {
    await api.createActivity(form);
    setModal(null);
    load();
  };

  const handleUpdate = async (form) => {
    await api.updateActivity(modal.id, form);
    setModal(null);
    load();
  };

  const filtered = activities.filter(a => !filterStatus || a.status === filterStatus);

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Activities"
        subtitle="Manage all environmental activities"
        action={<Btn onClick={() => setModal('create')}><Plus size={16} /> New Activity</Btn>}
      />

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterStatus === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['Activity', 'Area', 'Date', 'Location', 'Participants', 'Status', 'Actions']}>
          {filtered.map(act => (
            <tr key={act.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-800">{act.name}</td>
              <td className="px-4 py-3 text-slate-500">{act.area}</td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{act.date}</td>
              <td className="px-4 py-3 text-slate-500">{act.location}</td>
              <td className="px-4 py-3">
                <button onClick={() => openParticipants(act)} className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium">
                  <Users size={14} /> {act.participants_count}
                </button>
              </td>
              <td className="px-4 py-3"><Badge status={act.status} /></td>
              <td className="px-4 py-3">
                <Btn variant="ghost" size="sm" onClick={() => setModal(act)}>
                  <Pencil size={14} /> Edit
                </Btn>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Create Activity' : `Edit: ${modal?.name}`}
      >
        {modal === 'create'
          ? <ActivityForm onSave={handleCreate} onClose={() => setModal(null)} />
          : modal && <ActivityForm initial={modal} onSave={handleUpdate} onClose={() => setModal(null)} />
        }
      </Modal>

      {/* Participants Modal */}
      <Modal open={!!participantsModal} onClose={() => setParticipantsModal(null)} title={`Participants – ${participantsModal?.name}`}>
        <div className="divide-y divide-slate-100">
          {participants.length === 0 && <p className="py-8 text-center text-slate-400 text-sm">No participants yet.</p>}
          {participants.map(p => (
            <div key={p.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                <p className="text-xs text-slate-500">{p.email}</p>
              </div>
              <p className="text-xs text-slate-400">{p.joined_at?.slice(0,10)}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
