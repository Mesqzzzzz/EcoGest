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
  const [confirmLeave, setConfirmLeave] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const userRole = api.currentUser?.role;
  const isAdminOrCoord = ['admin', 'coordinator'].includes(userRole);
  const [viewMode, setViewMode] = useState(isAdminOrCoord ? 'all' : 'my');

  const load = () => {
    const fetcher = isAdminOrCoord 
      ? api.adminGetActivities(filterStatus ? { status: filterStatus } : {})
      : api.getActivities(filterStatus ? { status: filterStatus } : {});
      
    fetcher.then(d => { setActivities(d); setLoading(false); })
           .catch(err => { console.error(err); setLoading(false); });
  };
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

  const handleJoin = async (act) => {
    try {
      await api.participateInActivity(act.id, {});
      showNotification('Inscrição confirmada com sucesso!', 'success');
      load();
    } catch (e) { showNotification(e.message, 'error'); }
  };

  const handleLeaveClick = (act) => {
    setConfirmLeave(act);
  };

  const handleConfirmLeave = async () => {
    if (!confirmLeave) return;
    try {
      await api.cancelParticipation(confirmLeave.id, confirmLeave.user_participation.participation_id);
      showNotification('Inscrição cancelada.', 'success');
      setConfirmLeave(null);
      load();
    } catch (e) { showNotification(e.message, 'error'); }
  };

  let filtered = activities.filter(a => !filterStatus || a.status === filterStatus);
  if (!isAdminOrCoord) {
    if (viewMode === 'my') {
      filtered = filtered.filter(a => a.user_participation?.is_participating);
    } else if (viewMode === 'all') {
      // Only show active activities that the user is NOT participating in
      filtered = filtered.filter(a => a.status === 'active' && !a.user_participation?.is_participating);
    }
    // Sort descending by date (most recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const availableStatuses = isAdminOrCoord ? STATUSES : ['active', 'completed'];

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Activities"
        subtitle={isAdminOrCoord ? "Manage all environmental activities" : "Explore and manage your environmental initiatives"}
        action={isAdminOrCoord ? <Btn onClick={() => setModal('create')}><Plus size={16} /> New Activity</Btn> : null}
      />

      {!isAdminOrCoord && (
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setViewMode('my')}
            className={`pb-3 px-2 border-b-2 text-sm font-semibold transition-colors mr-8 ${viewMode === 'my' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            My Activities
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`pb-3 px-2 border-b-2 text-sm font-semibold transition-colors ${viewMode === 'all' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Available to Join
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', ...availableStatuses].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterStatus === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {!isAdminOrCoord && viewMode === 'my' && filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">You are not participating in any activities yet.</h3>
              <p className="text-slate-500 mb-6">Discover available environmental activities and join!</p>
              <Btn onClick={() => setViewMode('all')} size="lg">Explore Activities</Btn>
            </div>
          ) : !isAdminOrCoord && viewMode === 'all' && filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No activities available</h3>
              <p className="text-slate-500">There are currently no open activities for you to join.</p>
            </div>
          ) : (
            <Table headers={['Activity', 'Area', 'Date', 'Location', 'Participants', 'Status', isAdminOrCoord ? 'Actions' : 'Action']}>
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
                    {isAdminOrCoord ? (
                      <Btn variant="ghost" size="sm" onClick={() => setModal(act)}>
                        <Pencil size={14} /> Edit
                      </Btn>
                    ) : (
                      act.user_participation?.is_participating ? (
                        act.status === 'completed' ? (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg">Done</span>
                        ) : (
                          <Btn variant="danger" size="sm" onClick={() => handleLeaveClick(act)}>Leave</Btn>
                        )
                      ) : (
                        <Btn variant="primary" size="sm" onClick={() => handleJoin(act)} disabled={act.status !== 'active'}>
                          {act.status === 'active' ? 'Join' : 'Closed'}
                        </Btn>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </>
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

      {/* Confirm Leave Modal */}
      <Modal open={!!confirmLeave} onClose={() => setConfirmLeave(null)} title="Cancel Participation">
        <div className="space-y-4 pt-2">
          <p className="text-slate-600">Are you sure you want to cancel your participation in <strong>{confirmLeave?.name}</strong>?</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Btn variant="secondary" onClick={() => setConfirmLeave(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={handleConfirmLeave}>Yes, Leave Activity</Btn>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-xl border animate-fade-up z-50 flex items-center gap-3
          ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
        >
          <span className="text-xl leading-none">{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="font-semibold text-sm">{notification.msg}</p>
          <button onClick={() => setNotification(null)} className="ml-2 text-current opacity-60 hover:opacity-100 font-bold">&times;</button>
        </div>
      )}
    </div>
  );
}
