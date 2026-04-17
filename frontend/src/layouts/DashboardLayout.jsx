import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import {
  Leaf, LayoutDashboard, CalendarDays, FileText,
  Users, FolderKanban, Database, BarChart3, LogOut, ArrowLeft, Menu, X
} from 'lucide-react';
import { api } from '../services/api';

const navItems = [
  { label: 'Overview',    path: '/dashboard',            icon: LayoutDashboard },
  { label: 'Activities',  path: '/dashboard/activities', icon: CalendarDays },
  { label: 'Proposals',   path: '/dashboard/proposals',  icon: FileText },
  { label: 'Meetings',    path: '/dashboard/meetings',   icon: CalendarDays },
  { label: 'Projects',    path: '/dashboard/projects',   icon: FolderKanban },
  { label: 'Users',       path: '/dashboard/users',      icon: Users },
  { label: 'Reports',     path: '/dashboard/reports',    icon: BarChart3 },
  { label: 'Backups',     path: '/dashboard/backups',    icon: Database },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!api.currentUser) navigate('/login');
  }, [navigate]);

  const handleLogout = async () => {
    await api.logout();
    navigate('/');
  };

  const user = api.currentUser;
  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    coordinator: 'bg-blue-100 text-blue-700',
    secretary: 'bg-purple-100 text-purple-700',
    council_member: 'bg-amber-100 text-amber-700',
    user: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-slate-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-md">
              <Leaf size={22} />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800 leading-none">EcoGest</span>
              <p className="text-xs text-slate-500 mt-0.5">Dashboard</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User chip */}
        {user && (
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${roleColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 space-y-0.5">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all">
            <ArrowLeft size={18} /> Back to Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Leaf size={18} className="text-emerald-600" /> EcoGest
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.name.charAt(0)}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
