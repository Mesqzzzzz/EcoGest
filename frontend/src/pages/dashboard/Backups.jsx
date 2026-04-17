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
    await api.createBackup(description || 'Manual Backup');
    setSaving(false); setCreateOpen(false); setDescription('');
    load();
  };

  const handleRestore = async (b) => {
    if (!confirm(`Restore system from backup "${b.description}" (${b.created_at.slice(0,10)})? This cannot be undone.`)) return;
    setRestoring(b.id);
    try {
      await api.restoreBackup(b.id);
      alert('System restored successfully!');
    } catch(e) { alert(e.message); }
    setRestoring(null);
  };

  const formatDate = (iso) => new Date(iso).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="System Backups"
        subtitle="Create and restore system snapshots"
        action={<Btn onClick={() => setCreateOpen(true)}><Plus size={16} /> Create Backup</Btn>}
      />

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Database size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Backups are database snapshots. Restoring will overwrite all current data. Always create a fresh backup before restoring.
        </p>
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['Description', 'Created At', 'Size', 'Actions']}>
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
                  {restoring === b.id ? 'Restoring…' : 'Restore'}
                </Btn>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Backup Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Backup">
        <form onSubmit={handleCreate} className="space-y-4">
          <p className="text-sm text-slate-500">A full database snapshot will be saved with the timestamp of creation.</p>
          <FormField label="Description (optional)">
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Pre-deployment backup"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn type="submit" disabled={saving}><Database size={15} /> {saving ? 'Creating…' : 'Create Backup'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
