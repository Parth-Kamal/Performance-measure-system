import React, { useState } from 'react';
import { Star, MessageSquare, History, Lock, Send, ChevronRight, Search, Filter, AlertTriangle, Flag, User, Briefcase, Calendar } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useRole } from '../context/RoleContext';
import { mockFeedback, mockDetailedFeedback } from '../data/mockData';
import api from '../api';

const Feedback = () => {
  const { role: userRole } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [managerFilter, setManagerFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [realFeedback, setRealFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRealFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedback/all-detailed');
      setRealFeedback(res.data);
    } catch (err) {
      console.error('Failed to fetch real feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (userRole === 'admin') {
      fetchRealFeedback();
    }
  }, [userRole]);

  const managers = Array.from(new Set(realFeedback.map(f => f.managerName)));
  const departments = Array.from(new Set(realFeedback.map(f => f.department)));

  const filteredFeedback = realFeedback.filter(f => {
    const matchesSearch = f.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesManager = managerFilter === 'All' || matchesFilterValue(managerFilter, f.managerName);
    const matchesDept = deptFilter === 'All' || matchesFilterValue(deptFilter, f.department);
    
    let matchesRating = true;
    const effectiveRating = f.managerRating || f.selfRating;
    if (ratingFilter === 'Low') matchesRating = effectiveRating <= 2;
    else if (ratingFilter === 'Medium') matchesRating = effectiveRating === 3;
    else if (ratingFilter === 'High') matchesRating = effectiveRating >= 4;

    return matchesSearch && matchesManager && matchesDept && matchesRating;
  });

  function matchesFilterValue(filter: string, value: string) {
    if (filter === 'All' || filter === 'All Managers' || filter === 'All Departments' || filter === 'All Ratings') return true;
    return value === filter;
  }

  const renderStars = (rating: number | null) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} fill={rating && s <= rating ? "currentColor" : "none"} className={rating && s <= rating ? "text-warning" : "text-slate-200"} />
      ))}
    </div>
  );

  if (userRole === 'admin') {
    if (loading) return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">Feedback Analytics</h2>
            <p className="text-text-muted text-sm mt-1">Monitor live performance trends and identify calibration needs.</p>
          </div>
          <button 
            onClick={fetchRealFeedback}
            className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
          >
            Refresh Data
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[240px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by employee name..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-border rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase ml-2 tracking-widest">Manager</label>
              <select 
                className="px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
              >
                <option>All Managers</option>
                {managers.map(m => m && <option key={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase ml-2 tracking-widest">Department</label>
              <select 
                className="px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option>All Departments</option>
                {departments.map(d => d && <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase ml-2 tracking-widest">Rating Range</label>
              <select 
                className="px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option>All Ratings</option>
                <option>Low (≤ 2)</option>
                <option>Medium (3)</option>
                <option>High (≥ 4)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="grid grid-cols-1 gap-6 pb-12">
          {filteredFeedback.length === 0 ? (
            <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">No data found</h3>
              <p className="text-text-muted">Once employees and managers submit feedback, it will appear here.</p>
            </div>
          ) : filteredFeedback.map((f) => {
            const ratingMismatch = f.selfRating && f.managerRating && Math.abs(f.selfRating - f.managerRating) >= 2;
            const isFlagged = f.managerRating <= 2 && f.managerRating !== null;

            return (
              <div 
                key={f.id} 
                className={`bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md
                  ${isFlagged ? 'border-red-100 bg-red-50/10 shadow-red-100/50' : 'border-slate-100'}`}
              >
                <div className="p-8">
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-6 border-b border-slate-50">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-primary border border-slate-200 shadow-inner overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${f.employeeName}&background=EEF2FF&color=6366F1`} alt={f.employeeName} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-bold text-text-primary">{f.employeeName}</h4>
                          {isFlagged && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm ring-1 ring-red-200">
                              <Flag size={10} fill="currentColor" /> Flagged
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="text-xs font-bold text-text-muted flex items-center gap-1.5 uppercase tracking-wider">
                            <Briefcase size={12} className="text-primary" /> {f.department || 'General'}
                          </span>
                          <span className="text-xs font-bold text-text-muted flex items-center gap-1.5 uppercase tracking-wider">
                            <User size={12} className="text-primary" /> {f.managerName || 'System'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                       <StatusBadge status={f.status} />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Calendar size={10} /> {new Date(f.timestamp).toLocaleDateString()}
                       </p>
                    </div>
                  </div>

                  {/* Feedback Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
                    {/* Vertical Divider for Desktop */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2" />

                    {/* Self Feedback */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                          <User size={14} /> Self Feedback
                        </span>
                        {renderStars(f.selfRating)}
                      </div>
                      <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/30 min-h-[4rem]">
                        <p className="text-sm text-text-secondary leading-relaxed italic">
                          {f.selfComment ? (typeof f.selfComment === 'string' && f.selfComment.startsWith('{') ? "Comment submitted via form." : `"${f.selfComment}"`) : "Self-feedback not yet submitted."}
                        </p>
                      </div>
                    </div>

                    {/* Manager Feedback */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                          <Briefcase size={14} /> Manager Feedback
                        </span>
                        {renderStars(f.managerRating)}
                      </div>
                      <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/30 min-h-[4rem]">
                        <p className="text-sm text-text-secondary leading-relaxed italic">
                          {f.managerComment ? (typeof f.managerComment === 'string' && f.managerComment.startsWith('{') ? "Comment submitted via form." : `"${f.managerComment}"`) : "Manager feedback not yet submitted."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mismatch Warning */}
                  {ratingMismatch && (
                    <div className="mt-8 flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100/50 animate-pulse">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-warning shadow-sm">
                        <AlertTriangle size={20} />
                      </div>
                      <p className="text-sm font-bold text-amber-700">Rating mismatch detected — significant disparity between self and manager assessment.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
 
  // Employee View (Existing UI)
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Performance Feedback</h2>
          <p className="text-text-muted text-sm mt-1">Submit your self-assessment and view manager feedback.</p>
        </div>
        <StatusBadge status="Q2 Review Open" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-card border border-border overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Self-Feedback — Q2 2025 Review</h3>
              <StatusBadge status="Pending Submission" />
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-text-primary">What were your key achievements this cycle?</label>
                <textarea 
                  rows={4} 
                  placeholder="Summarize your impact and success stories..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-text-primary">What challenges or blockers did you face?</label>
                <textarea 
                  rows={4} 
                  placeholder="Be honest about any difficulties..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-text-primary">Rate your overall performance</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} className="text-warning hover:scale-110 transition-transform">
                        <Star size={24} fill={star <= 4 ? "currentColor" : "none"} strokeWidth={2} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted">4 out of 5 stars selected</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-text-primary">How well did you meet your goals?</label>
                  <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" />
                  <div className="flex justify-between text-[10px] font-bold text-text-muted">
                    <span>NEEDS HELP</span>
                    <span>EXCEEDED</span>
                  </div>
                </div>
              </div>

              <button className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 mt-8">
                <Send size={18} />
                Submit Self-Feedback
              </button>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-card border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-text-muted mb-4 opacity-50">
              <Lock size={32} />
            </div>
            <h4 className="text-lg font-bold text-text-secondary mb-2">Manager Feedback Locked</h4>
            <p className="text-sm text-text-muted max-w-sm">Feedback is only visible after both you and your manager have submitted your respective forms.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-card border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <History size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-text-primary">Past Reviews</h3>
            </div>
            <div className="space-y-4">
              {mockFeedback.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 hover:border-border transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm text-text-primary">{item.cycle}</p>
                    <StatusBadge status="Completed" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-warning">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < item.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-text-muted">{item.date}</span>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 text-xs font-bold text-primary hover:bg-primary-light rounded-lg transition-all flex items-center justify-center gap-1 mt-2">
                View All History <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
