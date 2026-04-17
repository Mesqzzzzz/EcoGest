import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Send } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Textarea, Table, Spinner } from '../../components/ui';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | meeting object
  const [convModal, setConvModal] = useState(null);
  const [convMsg, setConvMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', description: '' });

  const load = () => api.getMeetings().then(d => { setMeetings(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm({ title: '', date: '', description: '' });
    setModal('create');
  };

  const openEdit = (m) => {
    setForm({ title: m.title, date: m.date, description: m.description });
    setModal(m);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (modal === 'create') {
      await api.createMeeting(form);
    } else {
      await api.updateMeeting(modal.id, form);
    }
    setSaving(false);
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this meeting?')) return;
    await api.deleteMeeting(id);
    load();
  };

  const handleConvocation = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500)); // simulate email send
    setSaving(false);
    setConvModal(null);
    setConvMsg('');
    alert('Convocations sent successfully!');
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Meetings"
        subtitle="Schedule and manage team meetings"
        action={<Btn onClick={openCreate}><Plus size={16} /> New Meeting</Btn>}
      />

      {loading ? <Spinner /> : (
        <Table headers={['Title', 'Date', 'Participants', 'Status', 'Actions']}>
          {meetings.map(m => (
            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">{m.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{m.description}</p>
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{m.date}</td>
              <td className="px-4 py-3 text-slate-600">{m.participants ?? '—'}</td>
              <td className="px-4 py-3"><Badge status={m.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Btn variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil size={14} /></Btn>
                  <Btn variant="ghost" size="sm" onClick={() => setConvModal(m)}><Send size={14} /> Convoke</Btn>
                  {m.status !== 'completed' && (
                    <Btn variant="danger" size="sm" onClick={() => handleDelete(m.id)}><Trash2 size={14} /></Btn>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create / Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'New Meeting' : `Edit: ${modal?.title}`}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Title"><Input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Meeting title" /></FormField>
          <FormField label="Date"><Input type="date" required value={form.date} onChange={e => set('date', e.target.value)} /></FormField>
          <FormField label="Description / Agenda"><Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Agenda items…" rows={4} /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : (modal === 'create' ? 'Create Meeting' : 'Save Changes')}</Btn>
          </div>
        </form>
      </Modal>

      {/* Convocation Modal */}
      <Modal open={!!convModal} onClose={() => setConvModal(null)} title={`Send Convocations — ${convModal?.title}`}>
        <form onSubmit={handleConvocation} className="space-y-4">
          <p className="text-sm text-slate-500">An invitation email will be sent to all council members for the meeting on <strong>{convModal?.date}</strong>.</p>
          <FormField label="Optional message">
            <Textarea value={convMsg} onChange={e => setConvMsg(e.target.value)} placeholder="Add a personal note to the invitation…" rows={3} />
          </FormField>
          <div className="flex justify-end gap-3">
            <Btn variant="secondary" onClick={() => setConvModal(null)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}><Send size={15} /> {saving ? 'Sending…' : 'Send Convocations'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
