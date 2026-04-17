import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Leaf, Calendar, TrendingUp, Download } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, StatCard, Btn, Spinner } from '../../components/ui';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.getReport().then(d => { setReport(d); setLoading(false); });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(false);
    alert('Report generated and ready for download! (mock)');
  };

  if (loading) return <Spinner />;

  const completion = Math.round((report.completed_activities / report.total_activities) * 100);

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader
        title="Reports"
        subtitle="Project performance and engagement metrics"
        action={
          <Btn onClick={handleGenerate} disabled={generating}>
            <Download size={16} /> {generating ? 'Generating…' : 'Export PDF Report'}
          </Btn>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Leaf}       label="Total Activities"     value={report.total_activities}     color="emerald" />
        <StatCard icon={TrendingUp} label="Completed Activities"  value={report.completed_activities} color="teal"    sub={`${completion}% completion rate`} />
        <StatCard icon={Users}      label="Total Participants"    value={report.participants}          color="blue"   />
        <StatCard icon={Calendar}   label="Meetings Held"         value={report.meetings}             color="purple" />
        <StatCard icon={BarChart3}  label="Engagement Rate"       value={report.engagement_rate}      color="amber"  />
        <StatCard icon={Leaf}       label="Active Projects"       value={report.projects}             color="emerald" />
      </div>

      {/* Completion Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-6">Activity Completion Progress</h2>
        <div className="space-y-5">
          {[
            { label: 'Activities Completed', value: report.completed_activities, max: report.total_activities, color: 'bg-emerald-500' },
            { label: 'Participant Engagement', value: report.participants, max: 200, color: 'bg-blue-500' },
            { label: 'Meetings Conducted', value: report.meetings, max: 10, color: 'bg-purple-500' },
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
        <h2 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><BarChart3 size={20}/> Executive Summary</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          The EcoGest project has successfully executed <strong>{report.completed_activities}</strong> activities out of a planned <strong>{report.total_activities}</strong>, 
          achieving a completion rate of <strong>{completion}%</strong>. A total of <strong>{report.participants}</strong> participants 
          have been engaged across all environmental initiatives, with an overall engagement rate of <strong>{report.engagement_rate}</strong>. 
          The program is currently running across <strong>{report.projects}</strong> active project(s), 
          supported by <strong>{report.meetings}</strong> coordination meetings.
        </p>
      </div>
    </div>
  );
}
