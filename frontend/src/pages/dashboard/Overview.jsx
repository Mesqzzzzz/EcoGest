import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, CalendarDays, Users, FileText, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { StatCard, Badge, Spinner } from '../../components/ui';

export default function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getDashboardMetrics(),
      api.adminGetActivities(),
      api.getMeetings(),
    ]).then(([m, a, mt]) => {
      setMetrics(m);
      setActivities(a.slice(0, 5));
      setMeetings(mt.filter(m => m.status === 'scheduled').slice(0, 3));
    });
  }, []);

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

      {/* Stat Cards – staggered */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Leaf}         label="Total Activities"  value={metrics.activities.total}   color="emerald" sub={`${metrics.activities.active} active`} delay={0}   />
        <StatCard icon={Users}        label="Participants"      value={metrics.participants}        color="blue"    delay={100} />
        <StatCard icon={FileText}     label="Pending Proposals" value={metrics.proposals.pending}  color="amber"   delay={200} />
        <StatCard icon={CalendarDays} label="Meetings"          value={metrics.meetings}           color="purple"  delay={300} />
      </div>

      {/* Activity Lifecycle */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Planned',   value: metrics.activities.planned,   color: 'bg-blue-500',    ring: 'ring-blue-100'    },
          { label: 'Active',    value: metrics.activities.active,    color: 'bg-emerald-500', ring: 'ring-emerald-100' },
          { label: 'Completed', value: metrics.activities.completed, color: 'bg-slate-400',   ring: 'ring-slate-100'   },
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up delay-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Recent Activities</h2>
            <Link to="/dashboard/activities"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {activities.map((act, i) => (
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
            ))}
          </div>
        </div>

        {/* Upcoming meetings */}
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
      </div>

      {/* Quick action links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up delay-400">
        {[
          { label: 'Review Proposals', to: '/dashboard/proposals', color: 'hover:border-amber-300 hover:bg-amber-50', icon: '📋', count: metrics.proposals.pending },
          { label: 'Add Activity',     to: '/dashboard/activities', color: 'hover:border-emerald-300 hover:bg-emerald-50', icon: '🌱', count: null },
          { label: 'Schedule Meeting', to: '/dashboard/meetings',   color: 'hover:border-blue-300 hover:bg-blue-50',   icon: '📅', count: null },
          { label: 'View Reports',     to: '/dashboard/reports',    color: 'hover:border-purple-300 hover:bg-purple-50', icon: '📊', count: null },
        ].map(({ label, to, color, icon, count }) => (
          <Link key={to} to={to}
            className={`bg-white border border-slate-200 rounded-2xl p-5 text-center
              hover:shadow-md hover:-translate-y-1 transition-all duration-300 group ${color}`}
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-200">{icon}</span>
            <p className="text-sm font-semibold text-slate-700">{label}</p>
            {count > 0 && (
              <span className="mt-2 inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {count} pending
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
