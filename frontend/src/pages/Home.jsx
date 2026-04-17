import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Leaf, TreePine, Droplets, Zap } from 'lucide-react';
import { api } from '../services/api';

const areaIcons = {
  Environment: Leaf,
  Biodiversity: TreePine,
  Water: Droplets,
  Energy: Zap,
};

const areaGradients = {
  Environment: 'from-emerald-400 to-teal-500',
  Biodiversity: 'from-green-400 to-emerald-600',
  Energy: 'from-yellow-400 to-orange-500',
  Waste: 'from-slate-400 to-slate-600',
  Water: 'from-blue-400 to-cyan-500',
  Food: 'from-lime-400 to-green-500',
  Transport: 'from-indigo-400 to-blue-500',
};

function ActivityCard({ activity, index }) {
  const Icon = areaIcons[activity.area] || Leaf;
  const gradient = areaGradients[activity.area] || 'from-emerald-400 to-teal-500';

  return (
    <Link
      to={`/activities/${activity.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden
        hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 flex flex-col
        animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card Header */}
      <div className={`h-40 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/30" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-white/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={48} className="text-white opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300" />
        </div>
        <div className="absolute bottom-3 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {activity.area}
          </span>
        </div>
        {activity.status === 'active' && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">Active</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors duration-200">
          {activity.name}
        </h3>
        <p className="text-slate-500 text-sm mb-5 flex-grow line-clamp-2 leading-relaxed">
          {activity.description}
        </p>

        <div className="space-y-1.5 mb-5">
          <div className="flex items-center text-slate-500 text-sm gap-2">
            <Calendar size={14} className="text-emerald-500 flex-shrink-0" />
            <span>{activity.date}</span>
          </div>
          <div className="flex items-center text-slate-500 text-sm gap-2">
            <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center text-slate-500 text-sm gap-2">
            <Users size={14} className="text-emerald-500 flex-shrink-0" />
            <span>{activity.participants_count} participants</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-emerald-600 font-semibold text-sm group-hover:text-emerald-700 transition-colors">
          View Details
          <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActivities().then(data => {
      setActivities(data.filter(a => a.status !== 'completed'));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-28 sm:py-36">
        {/* Animated blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-300" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-500" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-down">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300
              font-semibold text-sm mb-8 border border-emerald-500/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              EcoGest 2026 Season is Active
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 animate-fade-up delay-150">
            Make the World{' '}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Greener Together
            </span>
          </h1>

          <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up delay-300">
            Join environmental initiatives, participate in local activities, and
            track our collective impact on the planet.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up delay-400">
            <a
              href="#activities"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-bold
                shadow-xl shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:-translate-y-1
                transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            >
              Browse Activities <ArrowRight size={20} />
            </a>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold
                border border-white/20 hover:border-white/30 hover:-translate-y-1
                transition-all duration-300 backdrop-blur-sm text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30L0 60Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1 mb-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Activities Running', value: `${activities.filter(a => a.status === 'active').length}+` },
            { label: 'Community Members', value: '200+' },
            { label: 'Eco Impact Score', value: '94/100' },
          ].map(({ label, value }, i) => (
            <div key={label}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center
                hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                animate-fade-up"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Activities ── */}
      <section id="activities" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10 animate-fade-left">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Activities</h2>
            <p className="text-slate-500 mt-2">Discover and join upcoming environmental initiatives.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="skeleton h-40 rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, i) => (
              <ActivityCard key={activity.id} activity={activity} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
