import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowLeft, Eye, EyeOff, User } from 'lucide-react';
import { api } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Efetuar registo no backend
      await api.register(name, email, password);
      // 2. Iniciar sessão automaticamente para a melhor UX
      await api.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao efetuar o registo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Esquerda – painel decorativo premium */}
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
              Junte-se à nossa<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                Comunidade Ecológica
              </span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed animate-fade-up delay-150">
              Crie a sua conta de membro e comece hoje mesmo a propor atividades eco-escolas, participar em iniciativas ambientais e colaborar connosco.
            </p>
          </div>

          <div className="flex gap-4 animate-fade-up delay-300">
            {['Iniciativas', 'Colaboração', 'Propostas', 'Ambiente'].map((tag) => (
              <span key={tag}
                className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-slate-200 backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Direita – formulário de registo */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-slate-50">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-emerald-50 p-1.5 rounded-lg text-white"><Leaf size={18} /></div>
            <span className="font-bold text-lg text-slate-800">EcoGest</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Criar Conta</h1>
          <p className="text-slate-500 mb-8">Registe-se gratuitamente para começar a usar a plataforma.</p>

          <form className="space-y-4" onSubmit={handleRegister}>
            {error && (
              <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium animate-scale-in">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="ex: João Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500
                    focus:border-emerald-500 outline-none transition-all duration-200 bg-white hover:border-slate-400 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Endereço de Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  placeholder="ex: joao@escola.pt"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500
                    focus:border-emerald-500 outline-none transition-all duration-200 bg-white hover:border-slate-400 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Palavra-passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type={showPw ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500
                    focus:border-emerald-500 outline-none transition-all duration-200 bg-white hover:border-slate-400 text-sm"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmar Palavra-passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Repita a palavra-passe"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500
                    focus:border-emerald-500 outline-none transition-all duration-200 bg-white hover:border-slate-400 text-sm"
                />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold text-white
                bg-slate-900 hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-emerald-200/50
                hover:shadow-lg active:scale-[0.98] disabled:opacity-50 text-sm pt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  A processar registo…
                </>
              ) : 'Criar Conta & Iniciar Sessão'}
            </button>
          </form>

          {/* Links para login e homepage */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-slate-600 text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                Iniciar Sessão
              </Link>
            </p>
            <div>
              <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
                <ArrowLeft size={14} /> Voltar para o Início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
