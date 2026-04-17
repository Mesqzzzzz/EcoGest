import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar() {
  const user = api.currentUser;

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-500 p-1.5 rounded-lg text-white group-hover:bg-emerald-600 transition">
            <Leaf size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">EcoGest</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Activities</Link>
          
          {user ? (
            <Link to="/dashboard" className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold hover:bg-emerald-200 transition">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="bg-slate-900 text-white px-5 py-2 rounded-full font-semibold hover:bg-slate-800 transition shadow-md hover:shadow-lg">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
