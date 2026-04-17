import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

const DEMO_ACCOUNTS = [
  { label: 'Admin',        email: 'admin@ecogest.pt',       role: 'bg-red-100 text-red-700' },
  { label: 'Coordinator',  email: 'coordenador@ecogest.pt', role: 'bg-blue-100 text-blue-700' },
  { label: 'Council',      email: 'conselheiro@ecogest.pt', role: 'bg-amber-100 text-amber-700' },
  { label: 'Secretary',    email: 'secretario@ecogest.pt',  role: 'bg-purple-100 text-purple-700' },
  { label: 'User',         email: 'joao@ecogest.pt',        role: 'bg-slate-100 text-slate-700' },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('coordenador@ecogest.pt');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-60 -right-20 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob delay-300" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-500" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <Leaf size={22} />
            </div>
            <span className="font-bold text-xl">EcoGest</span>
          </div>

          <div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight animate-fade-up">
              Manage your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                Eco Activities
              </span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed animate-fade-up delay-150">
              A unified platform for environmental proposals, meetings, participants and yearly project management.
            </p>
          </div>

          <div className="flex gap-4 animate-fade-up delay-300">
            {['Activities', 'Proposals', 'Meetings', 'Reports'].map((tag, i) => (
              <span key={tag}
                className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-slate-200 backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right – login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-slate-50">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-white"><Leaf size={18} /></div>
            <span className="font-bold text-lg text-slate-800">EcoGest</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your account to continue.</p>

          {/* Demo account quick-select */}
          <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Login (Demo)</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setEmail(acc.email)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 border-2
                    ${email === acc.email ? 'border-emerald-500 ' + acc.role : 'border-transparent ' + acc.role}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium animate-scale-in">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500
                    focus:border-emerald-500 outline-none transition-all duration-200 bg-white hover:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500
                    focus:border-emerald-500 outline-none transition-all duration-200 bg-white hover:border-slate-400"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Demo password is <code className="bg-slate-100 px-1 rounded">123</code></p>
            </div>

            <button
              disabled={loading} type="submit"
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white
                bg-slate-900 hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-emerald-200/50
                hover:shadow-lg active:scale-[0.98] disabled:opacity-50 text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
              <ArrowLeft size={14} /> Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
