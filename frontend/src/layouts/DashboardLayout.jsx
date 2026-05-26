import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import {
  Leaf, LayoutDashboard, CalendarDays, FileText,
  Users, FolderKanban, Database, BarChart3, LogOut, ArrowLeft, Menu, X, ClipboardCheck
} from 'lucide-react';
import { api } from '../services/api';

const getNavItems = (role) => {
  const allItems = [
    { label: 'Visão Geral',  path: '/dashboard',            icon: LayoutDashboard, roles: ['coordinator', 'council_member', 'secretary', 'user'] },
    { label: 'Atividades',   path: '/dashboard/activities', icon: CalendarDays, roles: ['coordinator', 'council_member', 'secretary', 'user'] },
    { label: 'Propostas',    path: '/dashboard/proposals',  icon: FileText, roles: ['coordinator', 'council_member'] },
    { label: 'Auditoria',    path: '/dashboard/audits',     icon: ClipboardCheck,  roles: ['coordinator', 'council_member', 'secretary'] },
    { label: 'Reuniões',     path: '/dashboard/meetings',   icon: CalendarDays, roles: ['coordinator', 'council_member', 'secretary'] },
    { label: 'Projetos',     path: '/dashboard/projects',   icon: FolderKanban, roles: ['admin', 'coordinator', 'council_member', 'secretary'] },
    { label: 'Utilizadores', path: '/dashboard/users',      icon: Users, roles: ['admin', 'coordinator'] },
    { label: 'Relatórios',   path: '/dashboard/reports',    icon: BarChart3, roles: ['coordinator'] },
    { label: 'Cópia de Segurança', path: '/dashboard/backups', icon: Database, roles: ['admin'] },
  ];

  return allItems.filter(item => item.roles.includes(role));
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!api.currentUser) {
      navigate('/login');
      return;
    }

    // Redirect if they land exactly on /dashboard and don't have access to Overview
    if (location.pathname === '/dashboard') {
      const allowed = getNavItems(api.currentUser.role);
      const hasOverview = allowed.some(item => item.path === '/dashboard');
      if (!hasOverview && allowed.length > 0) {
        navigate(allowed[0].path, { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await api.logout();
    navigate('/');
  };

  const user = api.currentUser;
  if (!user) return null;

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    coordinator: 'bg-blue-100 text-blue-700',
    secretary: 'bg-purple-100 text-purple-700',
    council_member: 'bg-amber-100 text-amber-700',
    user: 'bg-slate-100 text-slate-700',
  };

  const roleLabels = {
    admin: 'Administrador',
    coordinator: 'Coordenador',
    secretary: 'Secretário/a',
    council_member: 'Membro do Conselho',
    user: 'Utilizador',
  };

  const navItems = getNavItems(user.role);

  // Guard current route to ensure authorization
  const currentPath = location.pathname;
  const isAuthorized = navItems.some(item => {
    if (item.path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(item.path);
  });

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
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(user.name || '?').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${roleColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>
          </div>
        </div>

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
            <ArrowLeft size={18} /> Voltar ao Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={18} /> Sair
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
            {(user.name || '?').charAt(0)}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {isAuthorized ? (
            <Outlet />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm animate-fade-in">
              <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
                <X size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h2>
              <p className="text-slate-500 max-w-md mb-6">
                A sua conta de {roleLabels[user.role] || user.role} não tem permissão para aceder a esta secção.
              </p>
              <Link to={navItems[0]?.path || "/"} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold transition-all">
                Ir para {navItems[0]?.label || "Dashboard"}
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
