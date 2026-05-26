import React, { useEffect, useState } from 'react';
import { Plus, ArrowRightCircle } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Badge, Btn, Modal, FormField, Input, Select, Table, Spinner } from '../../components/ui';

const LEVELS = ['bronze', 'silver', 'gold'];
const STATUS_TRANSITIONS = { planning: ['active'], active: ['finished'], finished: [] };

const STATUS_LABELS = {
  planning: 'Planeamento',
  active: 'Ativo',
  finished: 'Concluído'
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear() });
  const [saving, setSaving] = useState(false);

  const userRole = api.currentUser?.role;
  const isAdmin = userRole === 'admin';
  const headers = isAdmin 
    ? ['Nome e Âmbito do Projeto', 'Ano', 'Estado', 'Nível Dinâmico e Progresso', 'Coordenador', 'Ações'] 
    : ['Nome e Âmbito do Projeto', 'Ano', 'Estado', 'Nível Dinâmico e Progresso', 'Coordenador'];

  const load = () => api.getProjects().then(d => { setProjects(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await api.createProject({ name: form.name, year: form.year });
    setSaving(false);
    setCreateOpen(false);
    setForm({ name: '', year: new Date().getFullYear() });
    load();
  };

  const advanceStatus = async (project) => {
    const next = STATUS_TRANSITIONS[project.status]?.[0];
    if (!next) return;
    await api.updateProjectStatus(project.id, next);
    load();
  };

  const coordinatorName = (project) => {
    return project.coordinator?.name || '—';
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Projetos"
        subtitle="Gerir projetos anuais de eco-escolas e acompanhar classificações dinâmicas de nível"
        action={isAdmin ? <Btn onClick={() => setCreateOpen(true)}><Plus size={16} /> Novo Projeto</Btn> : null}
      />

      {/* Legend & Level Criteria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: '🥇 Nível Ouro', desc: '>= 8 atividades concluídas e >= 4 áreas abrangidas' },
          { title: '🥈 Nível Prata', desc: '>= 4 atividades concluídas e >= 2 áreas abrangidas' },
          { title: '🥉 Nível Bronze', desc: '>= 1 atividade planeada ou ativa' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white/60 p-4 rounded-xl border border-slate-200 backdrop-blur-sm shadow-sm flex flex-col justify-center">
            <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <Table headers={headers}>
          {projects.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-800">
                <div>{p.name}</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  Scope: {p.activitiesCount || 0} atividades em {p.areasCount || 0} áreas
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{p.year}</td>
              <td className="px-4 py-3"><Badge status={p.status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge status={p.level || 'sem nível'} />
                    <span className="text-xs font-semibold text-slate-600">
                      {p.level === 'gold' ? 'Ouro' : p.level === 'silver' ? 'Prata' : p.level === 'bronze' ? 'Bronze' : 'Sem nível'}
                    </span>
                  </div>
                  {p.level !== 'gold' && (
                    <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 w-fit">
                      {p.level === 'silver' 
                        ? `Faltam ${Math.max(0, 8 - p.activitiesCount)} ativ. e ${Math.max(0, 4 - p.areasCount)} áreas para Ouro`
                        : p.level === 'bronze'
                        ? `Faltam ${Math.max(0, 4 - p.activitiesCount)} ativ. e ${Math.max(0, 2 - p.areasCount)} áreas para Prata`
                        : `Falta 1 atividade para Bronze`
                      }
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{coordinatorName(p)}</td>
              {isAdmin && (
                <td className="px-4 py-3">
                  {STATUS_TRANSITIONS[p.status]?.length > 0 && (
                    <Btn variant="ghost" size="sm" onClick={() => advanceStatus(p)}>
                      <ArrowRightCircle size={14} /> Avançar para {STATUS_LABELS[STATUS_TRANSITIONS[p.status][0]]}
                    </Btn>
                  )}
                </td>
              )}
            </tr>
          ))}
        </Table>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Projeto">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Nome do Projeto"><Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Eco Escolas 2027" /></FormField>
          <FormField label="Ano"><Input type="number" required value={form.year} onChange={e => set('year', parseInt(e.target.value))} min={2020} max={2040} /></FormField>
          
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500">
            <strong>Nota:</strong> O nível do projeto (Bronze, Prata, Ouro) será calculado e atualizado de forma dinâmica e automatizada à medida que novas atividades forem criadas e áreas diferenciadas forem abrangidas.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Btn>
            <Btn type="submit" disabled={saving}>{saving ? 'A criar…' : 'Criar Projeto'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
