import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Send, Leaf, CheckCircle, TreePine, Droplets, Zap } from 'lucide-react';
import { api } from '../services/api';

const areaGradients = {
  Environment: 'from-emerald-600 to-teal-700',
  Biodiversity: 'from-green-600 to-emerald-800',
  Energy: 'from-yellow-500 to-orange-600',
  Waste: 'from-slate-500 to-slate-700',
  Water: 'from-blue-500 to-cyan-700',
  Food: 'from-lime-500 to-green-700',
  Transport: 'from-indigo-500 to-blue-700',
};

const areaIcons = { Environment: Leaf, Biodiversity: TreePine, Water: Droplets, Energy: Zap };

export default function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getActivity(id)
      .then(data => { setActivity(data); setLoading(false); })
      .catch(() => navigate('/'));
  }, [id, navigate]);

  const handleParticipate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.participateInActivity(id, { name, email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to participate');
    }
    setSubmitting(false);
  };

  const gradient = activity ? (areaGradients[activity.area] || 'from-emerald-600 to-teal-700') : '';
  const Icon = activity ? (areaIcons[activity.area] || Leaf) : Leaf;

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="skeleton h-6 w-24 rounded-xl mb-8" />
      <div className="skeleton h-64 w-full rounded-3xl mb-6" />
      <div className="skeleton h-48 w-full rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Activities
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Hero Banner */}
        <div className={`h-64 bg-gradient-to-br ${gradient} relative overflow-hidden flex items-end p-8`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-6 right-8 w-40 h-40 rounded-full bg-white/40" />
            <div className="absolute -bottom-8 -left-8 w-52 h-52 rounded-full bg-white/20" />
          </div>
          <Icon size={80} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-10" />
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/30 mb-3">
              {activity.area}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{activity.name}</h1>
          </div>
          {activity.status === 'active' && (
            <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-white text-xs font-semibold">Active</span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Details */}
          <div className="p-8 flex-grow">
            <h3 className="text-lg font-bold text-slate-800 mb-3">About this activity</h3>
            <p className="text-slate-600 leading-relaxed mb-8">{activity.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Calendar, label: 'Date', value: activity.date },
                { icon: MapPin,   label: 'Location', value: activity.location },
                { icon: Users,    label: 'Participants', value: `${activity.participants_count || 0} joined` },
              ].map(({ icon: InfoIcon, label, value }) => (
                <div key={label}
                  className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100
                    hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200 group"
                >
                  <div className="bg-white p-2.5 rounded-xl shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                    <InfoIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Participation Panel */}
          <div className="lg:w-96 p-8 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100">
            {success ? (
              <div className="text-center animate-scale-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse-ring">
                  <CheckCircle size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">You're in! 🎉</h3>
                <p className="text-slate-500 text-sm mb-6">Your participation has been confirmed.</p>
                <Link to="/" className="text-emerald-600 hover:underline text-sm font-medium">
                  Browse more activities →
                </Link>
              </div>
            ) : (
              <div className="animate-fade-up">
                <h3 className="font-bold text-xl text-slate-800 mb-1">Join as Guest</h3>
                <p className="text-sm text-slate-500 mb-6">No account needed — just enter your details.</p>

                <form onSubmit={handleParticipate} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 animate-scale-in">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500
                        focus:border-emerald-500 outline-none transition-all bg-white hover:border-slate-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500
                        focus:border-emerald-500 outline-none transition-all bg-white hover:border-slate-400" />
                  </div>
                  <button disabled={submitting} type="submit"
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold
                      hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-emerald-200/50
                      hover:shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Confirming…</>
                      : <><Send size={18} /> Confirm Participation</>
                    }
                  </button>
                </form>

                {api.currentUser && (
                  <p className="text-xs text-slate-400 mt-4 text-center">
                    Logged in as <span className="font-medium text-slate-600">{api.currentUser.name}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
