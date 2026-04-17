import React from 'react';
import { useCountUp } from '../hooks/useAnimations';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-down">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = 'emerald', sub, delay = 0 }) {
  const num = typeof value === 'number' ? value : null;
  const animatedNum = useCountUp(num ?? 0);

  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', glow: 'group-hover:shadow-emerald-200' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100',    glow: 'group-hover:shadow-blue-200' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   glow: 'group-hover:shadow-amber-200' },
    purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100',  glow: 'group-hover:shadow-purple-200' },
    red:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100',     glow: 'group-hover:shadow-red-200' },
    teal:    { bg: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-100',    glow: 'group-hover:shadow-teal-200' },
  };
  const c = colors[color];

  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4
        shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`p-3 rounded-xl ${c.bg} ${c.text} transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 tabular-nums">
          {num !== null ? animatedNum : value}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    active:    'bg-emerald-100 text-emerald-700',
    planned:   'bg-blue-100 text-blue-700',
    completed: 'bg-slate-100 text-slate-600',
    pending:   'bg-amber-100 text-amber-700',
    approved:  'bg-emerald-100 text-emerald-700',
    rejected:  'bg-red-100 text-red-700',
    scheduled: 'bg-blue-100 text-blue-700',
    inactive:  'bg-red-100 text-red-700',
    finished:  'bg-slate-100 text-slate-600',
    planning:  'bg-purple-100 text-purple-700',
    gold:      'bg-yellow-100 text-yellow-700',
    silver:    'bg-slate-100 text-slate-600',
    admin:          'bg-red-100 text-red-700',
    coordinator:    'bg-blue-100 text-blue-700',
    secretary:      'bg-purple-100 text-purple-700',
    council_member: 'bg-amber-100 text-amber-700',
    user:           'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '' }) {
  const variants = {
    primary:   'bg-slate-900 text-white hover:bg-emerald-600 shadow-sm hover:shadow-emerald-200 hover:shadow-md',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-emerald-200',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input
      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl
        focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
        transition-all duration-200 text-sm hover:border-slate-400"
      {...props}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl
        focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
        transition-all duration-200 text-sm bg-white hover:border-slate-400"
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ ...props }) {
  return (
    <textarea
      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl
        focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
        transition-all duration-200 text-sm resize-none hover:border-slate-400"
      rows={3}
      {...props}
    />
  );
}

export function Table({ headers, children, empty }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {children || (
              <tr>
                <td colSpan={headers.length} className="px-4 py-12 text-center text-slate-400">
                  {empty || 'No data found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
      <div className="skeleton w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-6 w-16 rounded" />
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200" />
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin absolute inset-0" />
      </div>
      <p className="text-sm text-slate-400 font-medium">Loading…</p>
    </div>
  );
}
