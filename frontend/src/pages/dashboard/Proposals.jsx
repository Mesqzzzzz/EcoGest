import React, { useEffect, useState } from 'react';
import { Plus, Check, X, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Textarea, Select, Table, Spinner } from '../../components/ui';

const AREAS = ['Environment', 'Biodiversity', 'Energy', 'Waste', 'Water', 'Food', 'Transport'];

const AREA_LABELS = {
  Environment: 'Ambiente',
  Biodiversity: 'Biodiversidade',
  Energy: 'Energia',
  Waste: 'Resíduos',
  Water: 'Água',
  Food: 'Alimentação',
  Transport: 'Transporte',
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', area: 'Environment', start_date: '', end_date: '', resources: '' });
  const [saving, setSaving] = useState(false);

  const filterLabels = {
    '': 'Todas',
    pending: 'Pendentes',
    approved: 'Aprovadas',
    rejected: 'Rejeitadas'
  };

  const load = () => api.getProposals(filter ? { status: filter } : {}).then(d => { setProposals(d); setLoading(false); });
  useEffect(() => { load(); }, [filter]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await api.createProposal(form);
    setSaving(false);
    setCreateOpen(false);
    setForm({ title: '', description: '', area: 'Environment', start_date: '', end_date: '', resources: '' });
    load();
  };

  const handleStatus = async (id, status) => {
    await api.updateProposalStatus(id, status);
    load();
  };

  const statusFilters = ['', 'pending', 'approved', 'rejected'];

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Propostas"
        subtitle="Rever e gerir propostas de atividades"
        action={<Btn onClick={() => setCreateOpen(true)}><Plus size={16} /> Nova Proposta</Btn>}
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {statusFilters.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            {filterLabels[s] || s}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['Título', 'Área', 'Data de Início', 'Recursos', 'Estado', 'Ações']}>
          {proposals.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-800">{p.title}</td>
              <td className="px-4 py-3 text-slate-500">{AREA_LABELS[p.area] || p.area}</td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.start_date}</td>
              <td className="px-4 py-3 text-slate-500 text-sm max-w-xs truncate">{p.resources}</td>
              <td className="px-4 py-3"><Badge status={p.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Btn variant="ghost" size="sm" onClick={() => setDetail(p)}><Eye size={14} /></Btn>
                  {p.status === 'pending' && (
                    <>
                      <Btn variant="success" size="sm" onClick={() => handleStatus(p.id, 'approved')}><Check size={14} /> Aprovar</Btn>
                      <Btn variant="danger" size="sm" onClick={() => handleStatus(p.id, 'rejected')}><X size={14} /> Rejeitar</Btn>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Proposta">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Título"><Input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Título da proposta" /></FormField>
          <FormField label="Descrição"><Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva a proposta…" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Área">
              <Select value={form.area} onChange={e => set('area', e.target.value)}>
                {AREAS.map(a => <option key={a} value={a}>{AREA_LABELS[a] || a}</option>)}
              </Select>
            </FormField>
            <FormField label="Recursos"><Input value={form.resources} onChange={e => set('resources', e.target.value)} placeholder="ex: Luvas, sacos" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Data de Início"><Input type="date" required value={form.start_date} onChange={e => set('start_date', e.target.value)} /></FormField>
            <FormField label="Data de Fim"><Input type="date" required value={form.end_date} onChange={e => set('end_date', e.target.value)} /></FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'A submeter…' : 'Submeter Proposta'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title}>
        {detail && (
          <div className="space-y-4 text-sm">
            <div><p className="text-slate-500 font-medium mb-1">Descrição</p><p className="text-slate-800">{detail.description}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-slate-500 font-medium mb-1">Área</p><p className="text-slate-800">{AREA_LABELS[detail.area] || detail.area}</p></div>
              <div><p className="text-slate-500 font-medium mb-1">Estado</p><Badge status={detail.status} /></div>
              <div><p className="text-slate-500 font-medium mb-1">Data de Início</p><p className="text-slate-800">{detail.start_date}</p></div>
              <div><p className="text-slate-500 font-medium mb-1">Data de Fim</p><p className="text-slate-800">{detail.end_date}</p></div>
            </div>
            <div><p className="text-slate-500 font-medium mb-1">Recursos</p><p className="text-slate-800">{detail.resources}</p></div>
            {detail.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <Btn variant="success" className="flex-1" onClick={() => { handleStatus(detail.id, 'approved'); setDetail(null); }}><Check size={16}/> Aprovar</Btn>
                <Btn variant="danger"  className="flex-1" onClick={() => { handleStatus(detail.id, 'rejected'); setDetail(null); }}><X size={16}/> Rejeitar</Btn>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
