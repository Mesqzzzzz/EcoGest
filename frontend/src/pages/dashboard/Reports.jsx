import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Leaf, Calendar, TrendingUp, Download, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, StatCard, Btn, Spinner, Select, FormField } from '../../components/ui';
import { jsPDF } from 'jspdf';

export default function ReportsPage() {
  const [notification, setNotification] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('total');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    api.getReport().then(d => { setReport(d); setLoading(false); });
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const periodLabel = reportType === 'monthly' ? `${months[selectedMonth - 1]} de ${selectedYear}` : 
                        reportType === 'yearly' ? `${selectedYear}` : 'Geral';
      
      await api.generateReport({ type: reportType, month: selectedMonth, year: selectedYear });
      
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text("EcoGest", 105, 30, { align: "center" });
      
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59); // slate-800
      const typeLabel = reportType === 'monthly' ? 'MENSAL' : reportType === 'yearly' ? 'ANUAL' : 'GERAL';
      doc.text(`Relatório Ambiental ${typeLabel}`, 105, 45, { align: "center" });
      
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139); // slate-400
      doc.text(`Período: ${periodLabel}`, 105, 55, { align: "center" });
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(20, 65, 190, 65);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 20, 75);
      doc.text(`Responsável: ${api.currentUser?.name || 'N/A'}`, 20, 82);
 
      doc.setFont("helvetica", "bold");
      doc.text("Métricas Principais:", 20, 95);
      doc.setFont("helvetica", "normal");
      doc.text(`• Total de Atividades: ${report.total_activities}`, 30, 105);
      doc.text(`• Atividades Concluídas: ${report.completed_activities}`, 30, 112);
      doc.text(`• Total de Participantes envolvidos: ${report.participants}`, 30, 119);
      doc.text(`• Reuniões de Coordenação realizadas: ${report.meetings}`, 30, 126);
      doc.text(`• Taxa de Compromisso Global: ${report.engagement_rate}`, 30, 133);
      doc.text(`• Projetos Ativos monitorizados: ${report.projects}`, 30, 140);
 
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Executivo:", 20, 155);
      doc.setFont("helvetica", "normal");
      const typeText = reportType === 'monthly' ? 'mensal' : reportType === 'yearly' ? 'anual' : 'geral';
      const summary = `O projeto no período de ${periodLabel} atingiu uma taxa de conclusão de ${Math.round((report.completed_activities / report.total_activities) * 100)}%. Envolvemos com sucesso ${report.participants} participantes únicos em ${report.projects} projetos distintos. Este relatório ${typeText} para ${periodLabel} destaca o nosso compromisso com a sustentabilidade e a participação comunitária.`;
      const splitSummary = doc.splitTextToSize(summary, 170);
      doc.text(splitSummary, 20, 165);
 
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Este relatório foi automaticamente gerado pela Plataforma EcoGest.", 105, 280, { align: "center" });
      
      doc.save(`EcoGest_Relatorio_${reportType}_${periodLabel.replace(' ', '_')}.pdf`);
      
      setGenerating(false);
      setNotification({ msg: `Relatório ${typeText} em PDF (${periodLabel}) descarregado!`, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      setGenerating(false);
      setNotification({ msg: e.message, type: 'error' });
    }
  };

  if (loading) return <Spinner />;

  const completion = Math.round((report.completed_activities / report.total_activities) * 100);

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader
        title="Relatórios"
        subtitle="Desempenho do projeto e métricas de compromisso"
        action={
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm animate-fade-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase pl-2">Relatório:</span>
              <div className="w-36">
                <Select value={reportType} onChange={e => setReportType(e.target.value)} className="!py-1.5 !text-xs">
                  <option value="monthly">Relatório Mensal</option>
                  <option value="yearly">Relatório Anual</option>
                  <option value="total">Relatório Geral</option>
                </Select>
              </div>
            </div>

            {reportType === 'monthly' && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-32">
                  <Select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="!py-1.5 !text-xs">
                    {months.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {(reportType === 'monthly' || reportType === 'yearly') && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-24">
                  <Select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="!py-1.5 !text-xs">
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <Btn onClick={handleGenerate} disabled={generating} size="sm">
              <Download size={14} /> {generating ? 'A gerar…' : 'Descarregar PDF'}
            </Btn>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Leaf}       label="Total de Atividades"     value={report.total_activities}     color="emerald" />
        <StatCard icon={TrendingUp} label="Atividades Concluídas"  value={report.completed_activities} color="teal"    sub={`${completion}% taxa de conclusão`} />
        <StatCard icon={Users}      label="Total de Participantes"    value={report.participants}          color="blue"   />
        <StatCard icon={Calendar}   label="Reuniões Realizadas"         value={report.meetings}             color="purple" />
        <StatCard icon={BarChart3}  label="Taxa de Compromisso"       value={report.engagement_rate}      color="amber"  />
        <StatCard icon={Leaf}       label="Projetos Ativos"       value={report.projects}             color="emerald" />
      </div>

      {/* Completion Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-6">Progresso de Conclusão de Atividades</h2>
        <div className="space-y-5">
          {[
            { label: 'Atividades Concluídas', value: report.completed_activities, max: report.total_activities, color: 'bg-emerald-500' },
            { label: 'Compromisso de Participantes', value: report.participants, max: 200, color: 'bg-blue-500' },
            { label: 'Reuniões Realizadas', value: report.meetings, max: 10, color: 'bg-purple-500' },
          ].map(({ label, value, max, color }) => {
            const pct = Math.min(100, Math.round((value / max) * 100));
            return (
              <div key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">{label}</span>
                  <span className="text-slate-500">{value} / {max}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Text */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
        <h2 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><BarChart3 size={20}/> Resumo Executivo</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          O projeto EcoGest realizou com sucesso <strong>{report.completed_activities}</strong> de um total planeado de <strong>{report.total_activities}</strong> atividades, 
          atingindo uma taxa de conclusão de <strong>{completion}%</strong>. Um total de <strong>{report.participants}</strong> participantes 
          foram envolvidos em todas as iniciativas ambientais, com uma taxa de compromisso geral de <strong>{report.engagement_rate}</strong>. 
          O programa está atualmente a decorrer em <strong>{report.projects}</strong> projeto(s) ativo(s), 
          apoiado por <strong>{report.meetings}</strong> reuniões de coordenação.
        </p>
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
