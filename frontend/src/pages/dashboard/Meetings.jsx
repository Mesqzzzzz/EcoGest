import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Send, Upload, Download, FileText, Image, FileSearch } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Textarea, Table, Spinner, Select } from '../../components/ui';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | meeting object
  const [convModal, setConvModal] = useState(null);
  const [convMsg, setConvMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', description: '' });

  // States for Meeting Documents Archive
  const [archiveModal, setArchiveModal] = useState(null); // null | meeting object
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState('ata'); // 'ata' | 'foto' | 'other'
  const [docFile, setDocFile] = useState(null);

  const userRole = api.currentUser?.role;
  const canManageMeetings = ['admin', 'secretary'].includes(userRole);
  const canViewArchive = ['admin', 'coordinator', 'council_member', 'secretary'].includes(userRole);

  const load = () => api.getMeetings().then(d => { setMeetings(d); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });
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
    if (!window.confirm('Delete this meeting?')) return;
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

  // Archive Actions
  const openArchive = async (m) => {
    setArchiveModal(m);
    setDocLoading(true);
    setDocuments([]);
    try {
      const docs = await api.getMeetingDocuments(m.id);
      setDocuments(docs);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar documentos da reunião.');
    } finally {
      setDocLoading(false);
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docFile) return;
    setUploadingDoc(true);
    try {
      await api.uploadMeetingDocument(archiveModal.id, docFile, docType);
      const docs = await api.getMeetingDocuments(archiveModal.id);
      setDocuments(docs);
      setDocFile(null);
      // Reset input element
      const el = document.getElementById('meeting-doc-file');
      if (el) el.value = '';
    } catch (e) {
      console.error(e);
      alert(e.message || 'Erro ao carregar o documento.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Deseja mesmo remover este documento?')) return;
    try {
      await api.deleteMeetingDocument(docId);
      const docs = await api.getMeetingDocuments(archiveModal.id);
      setDocuments(docs);
    } catch (e) {
      console.error(e);
      alert('Erro ao eliminar documento.');
    }
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Meetings"
        subtitle="Schedule, manage convocations, and archive meeting photos and minutes (atas)"
        action={canManageMeetings ? <Btn onClick={openCreate}><Plus size={16} /> New Meeting</Btn> : null}
      />

      {loading ? <Spinner /> : (
        <Table headers={['Title & Agenda', 'Date', 'Status', 'Actions']}>
          {meetings.map(m => (
            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">{m.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{m.description}</p>
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{m.date}</td>
              <td className="px-4 py-3"><Badge status={m.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {canViewArchive && (
                    <Btn variant="primary" size="sm" onClick={() => openArchive(m)} className="flex items-center gap-1">
                      <FileSearch size={14} /> Atas & Fotos
                    </Btn>
                  )}
                  {canManageMeetings && (
                    <>
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil size={14} /></Btn>
                      <Btn variant="ghost" size="sm" onClick={() => setConvModal(m)}><Send size={14} /> Convoke</Btn>
                      {m.status !== 'completed' && (
                        <Btn variant="danger" size="sm" onClick={() => handleDelete(m.id)}><Trash2 size={14} /></Btn>
                      )}
                    </>
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

      {/* Meeting Archive Modal */}
      <Modal
        open={!!archiveModal}
        onClose={() => { setArchiveModal(null); setDocuments([]); }}
        title={`Arquivo da Reunião – ${archiveModal?.title}`}
        size="3xl"
      >
        <div className="space-y-6">
          {/* Upload panel for Admins/Secretaries */}
          {canManageMeetings && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <Upload size={16} className="text-emerald-600" />
                Carregar Novo Documento / Ata / Foto
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Selecione a ata da reunião ou uma fotografia de comprovação para arquivar neste projeto.
              </p>
              
              <form onSubmit={handleUploadDoc} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Tipo de Documento</label>
                  <Select value={docType} onChange={e => setDocType(e.target.value)}>
                    <option value="ata">Ata da Reunião (Minutes)</option>
                    <option value="foto">Fotografia da Reunião</option>
                    <option value="other">Outro Documento</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Ficheiro</label>
                  <input
                    type="file"
                    id="meeting-doc-file"
                    required
                    onChange={e => setDocFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
                <div>
                  <Btn type="submit" disabled={uploadingDoc || !docFile} className="w-full justify-center">
                    {uploadingDoc ? 'A enviar...' : 'Enviar Documento'}
                  </Btn>
                </div>
              </form>
            </div>
          )}

          {/* Documents view list */}
          <div className="border border-slate-200 rounded-2xl p-4">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">
              Ficheiros e Documentos no Arquivo ({documents.length})
            </h3>

            {docLoading ? (
              <Spinner />
            ) : documents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-500">Nenhum documento ou fotografia anexada a esta reunião.</p>
                {canManageMeetings && <p className="text-xs text-slate-400 mt-1">Utilize o painel acima para carregar a primeira ata.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => {
                  const isPhoto = doc.type === 'foto';
                  const docUrl = doc.documentUrl.startsWith('http') ? doc.documentUrl : `http://localhost:3000${doc.documentUrl}`;
                  
                  return (
                    <div key={doc._id} className="flex flex-col justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:shadow-sm hover:border-slate-300 transition-all">
                      <div className="flex gap-3 items-start">
                        <div className={`p-2.5 rounded-xl ${isPhoto ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isPhoto ? <Image size={20} /> : <FileText size={20} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 truncate" title={doc.name}>
                            {doc.name}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-600">
                            {doc.type === 'ata' ? 'Ata' : doc.type === 'foto' ? 'Foto' : 'Outro'}
                          </span>
                        </div>
                      </div>

                      {/* Photo preview if type is foto */}
                      {isPhoto && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 aspect-video">
                          <img src={docUrl} alt={doc.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-bold"
                        >
                          <Download size={13} /> Descarregar
                        </a>

                        {canManageMeetings && (
                          <button
                            onClick={() => handleDeleteDoc(doc._id)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar Documento"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Btn variant="secondary" onClick={() => { setArchiveModal(null); setDocuments([]); }}>
              Fechar Arquivo
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
