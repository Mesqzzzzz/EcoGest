import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Users, Check, Clock, X, Camera, UserPlus, Play, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Textarea, Select, Table, Spinner } from '../../components/ui';

const AREAS = ['Environment', 'Biodiversity', 'Energy', 'Waste', 'Water', 'Food', 'Transport'];
const STATUSES = ['planned', 'active', 'completed'];

const AREA_LABELS = {
  Environment: 'Ambiente',
  Biodiversity: 'Biodiversidade',
  Energy: 'Energia',
  Waste: 'Resíduos',
  Water: 'Água',
  Food: 'Alimentação',
  Transport: 'Transporte',
};

const STATUS_LABELS = {
  planned: 'Planeada',
  active: 'Ativa',
  completed: 'Concluída'
};

function ActivityForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', description: '', date: '', location: '', area: 'Environment', status: 'planned', resources: '' });
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
      <FormField label="Nome"><Input required value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
      <FormField label="Descrição"><Textarea value={form.description} onChange={e => set('description', e.target.value)} /></FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Data"><Input type="date" required value={form.date} onChange={e => set('date', e.target.value)} /></FormField>
        <FormField label="Área">
          <Select value={form.area} onChange={e => set('area', e.target.value)}>
            {AREAS.map(a => <option key={a} value={a}>{AREA_LABELS[a] || a}</option>)}
          </Select>
        </FormField>
      </div>
      <FormField label="Local"><Input value={form.location} onChange={e => set('location', e.target.value)} /></FormField>
      <FormField label="Recursos"><Input value={form.resources} onChange={e => set('resources', e.target.value)} placeholder="Ex: Papel reciclado, sementes biológicas..." /></FormField>
      {initial && (
        <FormField label="Estado">
          <Select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
          </Select>
        </FormField>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn type="submit" disabled={saving}>{saving ? 'A guardar…' : (initial ? 'Guardar Alterações' : 'Criar Atividade')}</Btn>
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

  // Estados para a execução de atividades
  const [executionOpen, setExecutionOpen] = useState(false);
  const [executingAct, setExecutingAct] = useState(null);
  const [executingDetails, setExecutingDetails] = useState(null);
  const [execStatus, setExecStatus] = useState('completed');
  const [execNotes, setExecNotes] = useState('');
  const [execLocation, setExecLocation] = useState('');
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });
  const [addingPart, setAddingPart] = useState(false);
  const [uploading, setUploading] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const userRole = api.currentUser?.role;
  const canManageActivities = ['admin', 'coordinator', 'council_member'].includes(userRole);
  const canExecuteActivities = ['coordinator', 'council_member'].includes(userRole);
  const [viewMode, setViewMode] = useState(canManageActivities ? 'all' : 'my');

  const load = () => {
    const fetcher = canManageActivities 
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

  const refreshExecutingDetails = async (activityId) => {
    try {
      const details = await api.getActivity(activityId);
      const parts = await api.getParticipants(activityId);
      setExecutingDetails({ ...details, participants: parts });
    } catch (e) {
      console.error(e);
    }
  };

  const openExecution = async (act) => {
    setExecutingAct(act);
    setExecStatus(act.status === 'planned' ? 'active' : act.status);
    setExecNotes(act.execution_notes || '');
    setExecLocation(act.execution_location || act.location || '');
    setExecutionOpen(true);
    setExecutingDetails(null);
    try {
      const details = await api.getActivity(act.id);
      const parts = await api.getParticipants(act.id);
      setExecutingDetails({ ...details, participants: parts });
    } catch (e) {
      console.error(e);
      showNotification('Erro ao carregar os detalhes da atividade.', 'error');
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipant.name || !newParticipant.email) return;
    setAddingPart(true);
    try {
      await api.addParticipant(executingAct.id, newParticipant);
      showNotification('Participante registado com sucesso!', 'success');
      setNewParticipant({ name: '', email: '' });
      await refreshExecutingDetails(executingAct.id);
      load(); // atualiza contagem na lista principal
    } catch (e) {
      showNotification(e.message || 'Erro ao registar participante.', 'error');
    } finally {
      setAddingPart(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadPhoto(executingAct.id, file);
      showNotification('Foto de execução enviada com sucesso!', 'success');
      await refreshExecutingDetails(executingAct.id);
    } catch (e) {
      showNotification(e.message || 'Erro ao enviar foto.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveExecution = async () => {
    try {
      if (execStatus === 'completed') {
        await api.registerExecution(executingAct.id, {
          executionLocation: execLocation,
          executionNotes: execNotes
        });
      } else {
        await api.updateActivityStatus(executingAct.id, execStatus);
      }
      showNotification('Execução/Estado da atividade guardado com sucesso!', 'success');
      setExecutionOpen(false);
      setExecutingAct(null);
      setExecutingDetails(null);
      load();
    } catch (e) {
      showNotification(e.message || 'Erro ao atualizar o estado da atividade.', 'error');
    }
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
  if (!canManageActivities) {
    if (viewMode === 'my') {
      filtered = filtered.filter(a => a.user_participation?.is_participating);
    } else if (viewMode === 'all') {
      // Only show active activities that the user is NOT participating in
      filtered = filtered.filter(a => a.status === 'active' && !a.user_participation?.is_participating);
    }
    // Sort descending by date (most recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const availableStatuses = canManageActivities ? STATUSES : ['active', 'completed'];

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Atividades"
        subtitle={canManageActivities ? "Gerir todas as atividades ambientais" : "Explore e gira as suas iniciativas ambientais"}
        action={canManageActivities ? <Btn onClick={() => setModal('create')}><Plus size={16} /> Nova Atividade</Btn> : null}
      />

      {!canManageActivities && (
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setViewMode('my')}
            className={`pb-3 px-2 border-b-2 text-sm font-semibold transition-colors mr-8 ${viewMode === 'my' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            As Minhas Atividades
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`pb-3 px-2 border-b-2 text-sm font-semibold transition-colors ${viewMode === 'all' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Disponíveis para Inscrição
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
            {s ? (STATUS_LABELS[s] || s) : 'Todas'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {!canManageActivities && viewMode === 'my' && filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Ainda não está a participar em nenhuma atividade.</h3>
              <p className="text-slate-500 mb-6">Descubra atividades ambientais disponíveis e inscreva-se!</p>
              <Btn onClick={() => setViewMode('all')} size="lg">Explorar Atividades</Btn>
            </div>
          ) : !canManageActivities && viewMode === 'all' && filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhuma atividade disponível</h3>
              <p className="text-slate-500">De momento, não existem atividades abertas para inscrição.</p>
            </div>
          ) : (
            <Table headers={['Atividade', 'Área', 'Data', 'Local', 'Participantes', 'Estado', canManageActivities ? 'Ações' : 'Ação']}>
              {filtered.map(act => (
                <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">{act.name}</td>
                  <td className="px-4 py-3 text-slate-500">{AREA_LABELS[act.area] || act.area}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{act.date}</td>
                  <td className="px-4 py-3 text-slate-500">{act.location}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openParticipants(act)} className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium">
                      <Users size={14} /> {act.participants_count}
                    </button>
                  </td>
                  <td className="px-4 py-3"><Badge status={act.status} /></td>
                  <td className="px-4 py-3">
                    {canManageActivities ? (
                      <div className="flex items-center gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => setModal(act)}>
                          <Pencil size={14} /> Editar
                        </Btn>
                        {canExecuteActivities && (
                          <Btn variant="success" size="sm" onClick={() => openExecution(act)}>
                            <Play size={14} /> Executar
                          </Btn>
                        )}
                      </div>
                    ) : (
                      act.user_participation?.is_participating ? (
                        act.status === 'completed' ? (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg">Concluída</span>
                        ) : (
                          <Btn variant="danger" size="sm" onClick={() => handleLeaveClick(act)}>Sair</Btn>
                        )
                      ) : (
                        <Btn variant="primary" size="sm" onClick={() => handleJoin(act)} disabled={act.status !== 'active'}>
                          {act.status === 'active' ? 'Participar' : 'Fechada'}
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
        title={modal === 'create' ? 'Criar Atividade' : `Editar: ${modal?.name}`}
      >
        {modal === 'create'
          ? <ActivityForm onSave={handleCreate} onClose={() => setModal(null)} />
          : modal && <ActivityForm initial={modal} onSave={handleUpdate} onClose={() => setModal(null)} />
        }
      </Modal>

      {/* Participants Modal */}
      <Modal open={!!participantsModal} onClose={() => setParticipantsModal(null)} title={`Participantes – ${participantsModal?.name}`}>
        <div className="divide-y divide-slate-100">
          {participants.length === 0 && <p className="py-8 text-center text-slate-400 text-sm">Ainda sem participantes.</p>}
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
      <Modal open={!!confirmLeave} onClose={() => setConfirmLeave(null)} title="Cancelar Inscrição">
        <div className="space-y-4 pt-2">
          <p className="text-slate-600">Tem a certeza de que deseja cancelar a sua participação em <strong>{confirmLeave?.name}</strong>?</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Btn variant="secondary" onClick={() => setConfirmLeave(null)}>Cancelar</Btn>
            <Btn variant="danger" onClick={handleConfirmLeave}>Sim, Sair da Atividade</Btn>
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

      {/* Execution Modal */}
      <Modal
        open={executionOpen}
        onClose={() => { setExecutionOpen(false); setExecutingAct(null); setExecutingDetails(null); }}
        title={`Registar Execução – ${executingAct?.name}`}
        size="2xl"
      >
        {!executingDetails ? (
          <Spinner />
        ) : (
          <div className="space-y-6">
            {/* Status Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <CheckCircle size={16} className="text-emerald-600" />
                Alterar Estado da Atividade
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Atualize o estado atual desta atividade. Definir como "completed" (Concluída) irá registar a execução.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <Select
                    value={execStatus}
                    onChange={e => setExecStatus(e.target.value)}
                    className="flex-1"
                  >
                    <option value="planned">Planeada (plano de atividades)</option>
                    <option value="active">Ativa (a decorrer/aberta a inscrições)</option>
                    <option value="completed">Concluída (executada)</option>
                  </Select>
                  <Btn onClick={handleSaveExecution} variant="primary">
                    Atualizar Estado
                  </Btn>
                </div>

                {execStatus === 'completed' && (
                  <div className="mt-2 space-y-4 border-t border-slate-200 pt-4 animate-fade-in">
                    <FormField label="Local Real da Execução (executionLocation)">
                      <Input
                        required
                        placeholder="Ex: Sala de Aula, Jardim da Escola, etc."
                        value={execLocation}
                        onChange={e => setExecLocation(e.target.value)}
                      />
                    </FormField>
                    <FormField label="Notas / Anotações de Execução (executionNotes)">
                      <Textarea
                        required
                        placeholder="Descreva brevemente os resultados, notas, observações, etc."
                        value={execNotes}
                        onChange={e => setExecNotes(e.target.value)}
                        rows={3}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Upload & Gallery Section */}
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <Camera size={16} className="text-blue-600" />
                Fotos de Execução
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Faça o upload de fotografias como prova da realização ou progresso da atividade.
              </p>

              {/* Upload input widget */}
              <div className="flex items-center gap-4 mb-4">
                <label className="flex flex-col items-center justify-center flex-1 h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-slate-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-2">
                    <Camera size={20} className="text-slate-400 mb-1" />
                    <p className="text-xs text-slate-600 font-medium">Clique para selecionar foto</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG ou JPEG</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="flex items-center justify-center px-4">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Photos Gallery */}
              {executingDetails.images && executingDetails.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {executingDetails.images.map((img, idx) => {
                    const imgUrl = img.imageUrl.startsWith('http') ? img.imageUrl : `http://localhost:3000${img.imageUrl}`;
                    return (
                      <div key={img._id || idx} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group">
                        <img
                          src={imgUrl}
                          alt={`Execução ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg">
                  Nenhuma foto de execução registada.
                </p>
              )}
            </div>

            {/* Manual Participant Roster & Form */}
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <Users size={16} className="text-amber-600" />
                Participantes Registados ({executingDetails.participants?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Registe participantes manualmente para a atividade ou consulte a lista dos já inscritos.
              </p>

              {/* Add participant form inline */}
              <form onSubmit={handleAddParticipant} className="flex gap-2 mb-4 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">NOME</label>
                  <Input
                    required
                    placeholder="Nome do participante"
                    value={newParticipant.name}
                    onChange={e => setNewParticipant(p => ({ ...p, name: e.target.value }))}
                    className="!py-1.5 !px-2.5"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">EMAIL</label>
                  <Input
                    required
                    type="email"
                    placeholder="email@escola.com"
                    value={newParticipant.email}
                    onChange={e => setNewParticipant(p => ({ ...p, email: e.target.value }))}
                    className="!py-1.5 !px-2.5"
                  />
                </div>
                <Btn type="submit" disabled={addingPart} variant="secondary" className="!py-2 border-emerald-500 hover:border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex-shrink-0">
                  <UserPlus size={14} /> Registo
                </Btn>
              </form>

              {/* Participants Roster */}
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50 rounded-lg border border-slate-100 px-3">
                {(!executingDetails.participants || executingDetails.participants.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Nenhum participante registado nesta atividade.
                  </p>
                ) : (
                  executingDetails.participants.map(p => (
                    <div key={p.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-500">{p.email}</p>
                      </div>
                      {p.joined_at && (
                        <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
                          {p.joined_at.slice(0, 10)}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Btn
                variant="secondary"
                onClick={() => {
                  setExecutionOpen(false);
                  setExecutingAct(null);
                  setExecutingDetails(null);
                }}
              >
                Fechar
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
