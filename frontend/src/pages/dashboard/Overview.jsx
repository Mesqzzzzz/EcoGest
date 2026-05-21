import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, CalendarDays, Users, FileText, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { StatCard, Badge, Spinner } from '../../components/ui';

export default function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const userRole = api.currentUser?.role;
  const isPrivileged = ['admin', 'coordinator', 'council_member'].includes(userRole);

  useEffect(() => {
    if (isPrivileged) {
      Promise.all([
        api.getDashboardMetrics(),
        api.adminGetActivities(),
        api.getMeetings(),
      ]).then(([m, a, mt]) => {
        setMetrics(m);
        setActivities(a.slice(0, 5));
        setMeetings(mt.filter(m => m.status === 'scheduled').slice(0, 3));
      }).catch(err => {
        console.error(err);
        setMetrics({ isUser: true });
      });
    } else {
      api.getActivities().then((a) => {
        setMetrics({ isUser: true });
        const myActivities = a.filter(act => act.user_participation?.is_participating);
        myActivities.sort((x, y) => new Date(y.date) - new Date(x.date));
        setActivities(myActivities.slice(0, 5));
        setMeetings([]); // Normal users don't see meetings
      }).catch(err => {
        console.error(err);
        setMetrics({ isUser: true });
      });
    }
  }, [isPrivileged]);

  if (!metrics) return <Spinner />;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Greeting */}
      <div className="animate-fade-down">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Good day, {api.currentUser?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Here's your EcoGest project summary.</p>
      </div>

      {isPrivileged && !metrics.isUser && (
        <>
          {/* Stat Cards – staggered */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Leaf}         label="Total Activities"  value={metrics.activities?.total || 0}   color="emerald" sub={`${metrics.activities?.active || 0} active`} delay={0}   />
            <StatCard icon={Users}        label="Participants"      value={metrics.participants || 0}        color="blue"    delay={100} />
            <StatCard icon={FileText}     label="Pending Proposals" value={metrics.proposals?.pending || 0}  color="amber"   delay={200} />
            <StatCard icon={CalendarDays} label="Meetings"          value={metrics.meetings || 0}           color="purple"  delay={300} />
          </div>

          {/* Activity Lifecycle */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Planned',   value: metrics.activities?.planned || 0,   color: 'bg-blue-500',    ring: 'ring-blue-100'    },
              { label: 'Active',    value: metrics.activities?.active || 0,    color: 'bg-emerald-500', ring: 'ring-emerald-100' },
              { label: 'Completed', value: metrics.activities?.completed || 0, color: 'bg-slate-400',   ring: 'ring-slate-100'   },
            ].map(({ label, value, color, ring }, i) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${400 + i * 80}ms` }}
              >
                <div className={`w-4 h-4 rounded-full ${color} mx-auto mb-3 ring-4 ${ring}`} />
                <p className="text-3xl font-extrabold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Month-over-Month Activity Volume & Incentives */}
          {metrics.monthlyStats && metrics.monthlyStats.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-up delay-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <span>📈</span> Incentivo e Volume de Atividades MoM
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comparação do volume de atividades concluídas e fotos recolhidas nos últimos meses
                  </p>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 block shadow-sm" />
                    <span className="text-slate-600">Atividades Concluídas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-blue-400 to-blue-600 block shadow-sm" />
                    <span className="text-slate-600">Fotos Recolhidas</span>
                  </div>
                </div>
              </div>

              {/* MoM Motivational Card */}
              {(() => {
                const monthlyStats = metrics.monthlyStats;
                const lastMonthData = monthlyStats[4] || { completedActivities: 0, photosCollected: 0, ptLabel: 'mês passado' };
                const prevMonthData = monthlyStats[3] || { completedActivities: 0, photosCollected: 0, ptLabel: 'mês anterior' };

                const lastMonthAct = lastMonthData.completedActivities;
                const prevMonthAct = prevMonthData.completedActivities;
                const lastMonthPhotos = lastMonthData.photosCollected;

                const isGrowthAct = lastMonthAct >= prevMonthAct;

                return (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-100 flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                    <span className="text-3xl">💡</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">
                        {isGrowthAct ? 'Excelente Progresso no Mês Passado!' : 'Vamos Impulsionar o Volume de Atividades!'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isGrowthAct ? (
                          <span>
                            O volume de atividade de <strong>{lastMonthData.ptLabel}</strong> ({lastMonthAct} atividades terminadas) 
                            {lastMonthAct === prevMonthAct ? ' manteve o excelente ritmo do mês anterior' : ` superou o de ${prevMonthData.ptLabel} (${prevMonthAct} atividades)`}. 
                            Com <strong>{lastMonthPhotos} fotos</strong> recolhidas, a vossa escola está de parabéns!
                          </span>
                        ) : (
                          <span>
                            O volume de <strong>{lastMonthData.ptLabel}</strong> registou {lastMonthAct} atividades terminadas, 
                            em comparação com {prevMonthAct} em {prevMonthData.ptLabel}. 
                            Que tal mobilizar o conselho para registar e concluir mais atividades esta semana? Cada ação conta!
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Simple CSS Bar Chart */}
              <div className="pt-4 h-48 flex items-end justify-between gap-2 border-b border-slate-100 px-2 sm:px-6">
                {metrics.monthlyStats.map((item, idx) => {
                  const maxVal = Math.max(...metrics.monthlyStats.map(m => Math.max(m.completedActivities, m.photosCollected)), 5);
                  const actPct = Math.min(100, Math.max(10, (item.completedActivities / maxVal) * 100));
                  const photoPct = Math.min(100, Math.max(10, (item.photosCollected / maxVal) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                      {/* Hover labels container */}
                      <div className="w-full flex justify-center gap-1.5 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-100">
                          {item.completedActivities}
                        </span>
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 rounded border border-blue-100">
                          {item.photosCollected}
                        </span>
                      </div>

                      {/* Bars */}
                      <div className="w-full flex items-end justify-center gap-1.5 h-[65%]">
                        {/* Activities Bar */}
                        <div 
                          style={{ height: `${actPct}%` }}
                          className="w-3 sm:w-5 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t shadow-sm transition-all duration-500 hover:brightness-95 cursor-pointer"
                          title={`${item.completedActivities} Atividades Concluídas`}
                        />
                        {/* Photos Bar */}
                        <div 
                          style={{ height: `${photoPct}%` }}
                          className="w-3 sm:w-5 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t shadow-sm transition-all duration-500 hover:brightness-95 cursor-pointer"
                          title={`${item.photosCollected} Fotos`}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-xs font-semibold text-slate-500 mt-2 capitalize group-hover:text-slate-800 transition-colors truncate max-w-full">
                        {item.ptLabel || item.label}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {item.year}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className={`grid grid-cols-1 ${isPrivileged ? 'lg:grid-cols-5' : ''} gap-6`}>
        {/* Recent Activities */}
        <div className={`${isPrivileged ? 'lg:col-span-3' : ''} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up delay-200`}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">{isPrivileged ? 'Recent Activities' : 'Your Activities'}</h2>
            <Link to="/dashboard/activities"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={act.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-150
                  animate-fade-left"
                style={{ animationDelay: `${300 + i * 60}ms` }}
              >
                <div className="min-w-0 mr-4">
                  <p className="font-semibold text-slate-800 truncate">{act.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Calendar size={11} /> {act.date} &bull; {act.location}
                  </p>
                </div>
                <Badge status={act.status} />
              </div>
            )) : (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-slate-500 mb-3">You haven't joined any activities yet.</p>
                <Link to="/dashboard/activities" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Explore Available Activities &rarr;</Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming meetings */}
        {isPrivileged && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up delay-300">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Upcoming Meetings</h2>
              <Link to="/dashboard/meetings"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {meetings.map((m, i) => (
                <div key={m.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors animate-fade-left"
                  style={{ animationDelay: `${400 + i * 80}ms` }}
                >
                  <p className="font-semibold text-slate-800 text-sm">{m.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar size={11} /> {m.date} &bull; {m.participants} participants
                  </p>
                </div>
              ))}
              {meetings.length === 0 && (
                <p className="px-6 py-10 text-center text-sm text-slate-400">No upcoming meetings</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick action links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up delay-400">
        {['admin', 'coordinator', 'council_member'].includes(userRole) && (
          <Link to="/dashboard/proposals" className="bg-white border border-slate-200 rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group hover:border-amber-300 hover:bg-amber-50">
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-200">📋</span>
            <p className="text-sm font-semibold text-slate-700">Review Proposals</p>
            {isPrivileged && !metrics.isUser && metrics.proposals?.pending > 0 && (
              <span className="mt-2 inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {metrics.proposals.pending} pending
              </span>
            )}
          </Link>
        )}
        
        <Link to="/dashboard/activities" className="bg-white border border-slate-200 rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group hover:border-emerald-300 hover:bg-emerald-50">
          <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-200">🌱</span>
          <p className="text-sm font-semibold text-slate-700">{isPrivileged ? 'Add Activity' : 'View Activities'}</p>
        </Link>
        
        {userRole !== 'user' && (
          <Link to="/dashboard/meetings" className="bg-white border border-slate-200 rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group hover:border-blue-300 hover:bg-blue-50">
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-200">📅</span>
            <p className="text-sm font-semibold text-slate-700">{['admin', 'coordinator', 'secretary'].includes(userRole) ? 'Schedule Meeting' : 'View Meetings'}</p>
          </Link>
        )}
        
        {userRole === 'admin' && (
          <Link to="/dashboard/reports" className="bg-white border border-slate-200 rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group hover:border-purple-300 hover:bg-purple-50">
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-200">📊</span>
            <p className="text-sm font-semibold text-slate-700">View Reports</p>
          </Link>
        )}
      </div>
    </div>
  );
}
