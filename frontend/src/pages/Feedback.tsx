import React from 'react';
import { Star, MessageSquare, History, Lock, Send, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { mockFeedback } from '../data/mockData';

const Feedback = () => {
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
