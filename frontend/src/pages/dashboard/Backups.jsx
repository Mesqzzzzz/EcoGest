import React, { useEffect, useState } from 'react';
import { Database, Plus, RotateCcw, HardDrive, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Btn, Modal, FormField, Input, Table, Spinner } from '../../components/ui';

export default function BackupsPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(null);

  const load = () => api.getBackups().then(d => { setBackups(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    await api.createBackup(description || 'Cópia de Segurança Manual');
    setSaving(false); setCreateOpen(false); setDescription('');
    load();
  };

  const handleRestore = async (b) => {
    if (!confirm(`Deseja restaurar o sistema a partir da cópia de segurança "${b.description}" (${b.created_at.slice(0,10)})? Esta ação não pode ser desfeita.`)) return;
    setRestoring(b.id);
    try {
      await api.restoreBackup(b.id);
      alert('Sistema restaurado com sucesso!');
    } catch(e) { alert(e.message); }
    setRestoring(null);
  };

  const formatDate = (iso) => new Date(iso).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Cópias de Segurança"
        subtitle="Criar e restaurar cópias de segurança do sistema"
        action={<Btn onClick={() => setCreateOpen(true)}><Plus size={16} /> Criar Cópia de Segurança</Btn>}
      />

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Database size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          As cópias de segurança são instantâneos da base de dados. Restaurar irá substituir todos os dados atuais. Crie sempre uma nova cópia de segurança antes de restaurar.
        </p>
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['Descrição', 'Criada em', 'Tamanho', 'Ações']}>
          {backups.map(b => (
            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><HardDrive size={16} /></div>
                  <span className="font-semibold text-slate-800">{b.description}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                  <Clock size={14} className="text-slate-400" /> {formatDate(b.created_at)}
                </div>
              </td>
              <td className="px-4 py-4 text-slate-500 text-sm">{b.size}</td>
              <td className="px-4 py-4">
                <Btn
                  variant="secondary" size="sm"
                  disabled={restoring === b.id}
                  onClick={() => handleRestore(b)}
                >
                  <RotateCcw size={14} className={restoring === b.id ? 'animate-spin' : ''} />
                  {restoring === b.id ? 'A restaurar…' : 'Restaurar'}
                </Btn>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Backup Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Criar Nova Cópia de Segurança">
        <form onSubmit={handleCreate} className="space-y-4">
          <p className="text-sm text-slate-500">Um instantâneo completo da base de dados será guardado com a data/hora de criação.</p>
          <FormField label="Descrição (opcional)">
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="ex: Cópia antes da implementação"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Btn>
            <Btn type="submit" disabled={saving}><Database size={15} /> {saving ? 'A criar…' : 'Criar Cópia de Segurança'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
