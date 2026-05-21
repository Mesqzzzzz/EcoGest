import React, { useEffect, useState } from 'react';
import { Leaf, Droplets, Zap, Trash2, Save, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, Btn, FormField, Textarea, Spinner, Badge } from '../../components/ui';

const CATEGORIES = [
  { id: 'Water', label: 'Água (Water)', icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'Energy', label: 'Energia (Energy)', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { id: 'Waste', label: 'Resíduos (Waste)', icon: Leaf, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
];

export default function AuditsPage() {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: { value: 'Sim' | 'Não' | 'Parcialmente', comments: '' } }
  const [report, setReport] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Water');
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch active project
      const projId = await api._activeProjectId();
      if (!projId) {
        setLoading(false);
        return;
      }
      setActiveProjectId(projId);

      // Fetch questions and existing responses
      const [quests, resps, rep] = await Promise.all([
        api.getAuditQuestions(),
        api.getAuditResponses(projId),
        api.getAuditReport(projId)
      ]);

      setQuestions(quests);
      setReport(rep);

      // Map existing responses to local state
      const mappedAnswers = {};
      resps.forEach(r => {
        if (r.question) {
          const qId = r.question._id || r.question.id || r.question;
          mappedAnswers[qId] = {
            value: r.value,
            comments: r.comments || ''
          };
        }
      });
      setAnswers(mappedAnswers);

    } catch (e) {
      console.error(e);
      showNotification('Erro ao carregar os dados da auditoria.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectValue = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || { comments: '' }),
        value: val
      }
    }));
  };

  const handleCommentChange = (qId, text) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || { value: null }),
        comments: text
      }
    }));
  };

  const handleSave = async () => {
    if (!activeProjectId) return;
    setSaving(true);
    try {
      const responsePayload = Object.keys(answers)
        .filter(qId => answers[qId]?.value) // only save questions that are answered
        .map(qId => ({
          questionId: qId,
          value: answers[qId].value,
          comments: answers[qId].comments
        }));

      await api.submitAuditResponses({
        projectId: activeProjectId,
        responses: responsePayload
      });

      showNotification('Respostas da auditoria guardadas com sucesso!', 'success');
      
      // Reload report metrics
      const updatedReport = await api.getAuditReport(activeProjectId);
      setReport(updatedReport);
    } catch (e) {
      console.error(e);
      showNotification(e.message || 'Erro ao guardar auditoria.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  if (!activeProjectId) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="bg-red-50 text-red-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-sm animate-bounce">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Nenhum Projeto Ativo Encontrado</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
          Deve criar um projeto anual ativo no separador "Projects" antes de preencher a auditoria ambiental da escola.
        </p>
      </div>
    );
  }

  // Filter questions for active tab
  const filteredQuestions = questions.filter(q => q.category === activeTab);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Auditoria Ambiental"
        subtitle="Auditoria Ambiental Eco-Escolas para avaliação contínua"
        action={
          <Btn onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            <Save size={16} />
            {saving ? 'A Guardar...' : 'Guardar Progresso'}
          </Btn>
        }
      />

      {/* Reports Overview Panel */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-down">
          {/* Overall Gauge / Stat */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Progresso Geral</span>
              <h3 className="text-3xl font-extrabold mt-1">{report.overallProgress}%</h3>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
              <div 
                style={{ width: `${report.overallProgress}%` }} 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block font-semibold">
              Pontuação Geral: {report.overallScore}/100
            </span>
          </div>

          {/* Category Scores */}
          {CATEGORIES.map(cat => {
            const catScore = report.categoryScores?.find(c => c.category === cat.id) || {
              progress: 0,
              averageScore: 0,
              answeredCount: 0,
              totalCount: 0
            };
            const CatIcon = cat.icon;

            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{cat.label.split(' ')[0]}</span>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{catScore.averageScore}%</h3>
                  </div>
                  <div className={`p-2 rounded-xl border ${cat.color}`}>
                    <CatIcon size={18} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                    <span>PROGRESSO</span>
                    <span>{catScore.answeredCount}/{catScore.totalCount} Respostas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${catScore.progress}%` }} 
                      className="bg-slate-900 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {CATEGORIES.map(cat => {
          const isActive = activeTab === cat.id;
          const CatIcon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`pb-3 px-1 border-b-2 text-sm font-bold flex items-center gap-2 transition-all ${
                isActive 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <CatIcon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-sm">Não existem questões nesta categoria.</p>
        ) : (
          filteredQuestions.map((q, idx) => {
            const currentAns = answers[q._id || q.id];
            const selectedVal = currentAns?.value;
            const commentVal = currentAns?.comments || '';

            return (
              <div 
                key={q._id || q.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all duration-200 animate-fade-left"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs">
                      {q.code}
                    </span>
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base mt-0.5 leading-snug">
                      {q.text}
                    </h3>
                  </div>
                </div>

                {/* Option Buttons */}
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: 'Sim (Yes)', value: 'Sim', color: 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100', activeColor: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-100' },
                    { label: 'Parcialmente (Partially)', value: 'Parcialmente', color: 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100', activeColor: 'bg-amber-500 border-amber-500 text-white shadow-amber-100' },
                    { label: 'Não (No)', value: 'Não', color: 'border-red-200 text-red-800 bg-red-50 hover:bg-red-100', activeColor: 'bg-red-600 border-red-600 text-white shadow-red-100' }
                  ].map(opt => {
                    const isSelected = selectedVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectValue(q._id || q.id, opt.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-sm ${
                          isSelected 
                            ? `${opt.activeColor} scale-[1.03] shadow-md` 
                            : `${opt.color} opacity-75 hover:opacity-100`
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Observation Comments */}
                <div className="pt-2">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Anotações / Observações</label>
                  <Textarea
                    placeholder="Adicione observações sobre esta questão da auditoria ambiental..."
                    value={commentVal}
                    onChange={e => handleCommentChange(q._id || q.id, e.target.value)}
                    rows={1}
                    className="!py-2 text-xs"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Save Bar */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <CheckCircle size={15} className="text-emerald-500" />
          <span>As alterações são guardadas na base de dados do projeto ativo.</span>
        </div>
        <Btn onClick={handleSave} disabled={saving} size="md">
          {saving ? 'A Guardar...' : 'Guardar Auditoria'}
        </Btn>
      </div>

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
