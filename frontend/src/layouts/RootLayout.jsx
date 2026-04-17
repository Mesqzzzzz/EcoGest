import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-slate-500 text-sm">
        &copy; 2026 EcoGest. All rights reserved.
      </footer>
    </div>
  );
}
