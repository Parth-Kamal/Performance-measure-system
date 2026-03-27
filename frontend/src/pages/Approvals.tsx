import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Clock, User, Filter, Search, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import api from '../api';

const Approvals = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [pendingGoals, setPendingGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals/manager/pending');
      setPendingGoals(res.data);
    } catch (err) {
      console.error('Failed to fetch pending goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (goalId: string, action: 'approve' | 'reject', status: string) => {
    try {
      const isCompletion = status === 'pending completion approval';
      
      if (action === 'approve') {
        if (!isCompletion) {
          const weightage = prompt('Confirm or adjust weightage (%)', '25');
          if (weightage === null) return;
          await api.put(`/goals/${goalId}/approve`, { weightage: parseFloat(weightage) });
        } else {
          if (!confirm('Are you sure you want to approve this goal as completed?')) return;
          await api.put(`/goals/${goalId}/complete-approve`);
        }
      } else {
        const reason = prompt('Reason for rejection');
        if (reason === null) return;
        
        if (!isCompletion) {
          await api.put(`/goals/${goalId}/reject`, { reason });
        } else {
          await api.put(`/goals/${goalId}/complete-reject`, { reason });
        }
      }
      alert(`Goal completion successfully ${action}d! ✅`);
      fetchPending();
    } catch (err) {
      alert(`Failed to ${action} goal`);
    }
  };

  const columns = [
    { 
      key: 'employee_name', 
      label: 'Employee',
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-xs">
            {val ? val.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <span className="font-bold">{val || 'Unknown'}</span>
        </div>
      )
    },
    { key: 'title', label: 'Goal Title' },
    { 
      key: 'status', 
      label: 'Type',
      render: (val: string) => (
        <span className={`px-2 py-1 rounded-badge text-[10px] font-bold uppercase ${val === 'pending approval' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>
          {val === 'pending approval' ? 'Initial Goal' : 'Completion'}
        </span>
      )
    },
    { 
      key: 'submitted_at', 
      label: 'Date',
      render: (val: string) => val ? new Date(val).toLocaleDateString() : '-'
    },
    { 
      key: 'weightage', 
      label: 'Weightage',
      render: (val: number) => <span className="font-bold text-primary">{val}%</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleAction(row.id, 'approve', row.status)}
            className="p-2 bg-success/10 text-success hover:bg-success hover:text-white rounded-lg transition-all" 
            title="Approve"
          >
            <Check size={16} />
          </button>
          <button 
            onClick={() => handleAction(row.id, 'reject', row.status)}
            className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all" 
            title="Reject"
          >
            <X size={16} />
          </button>
          <button className="p-2 bg-slate-100 text-text-secondary hover:bg-slate-200 rounded-lg transition-all" title="View Details">
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner">
              <Check size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Approval Center</h2>
            {pendingGoals.length > 0 && (
              <span className="bg-danger/10 text-danger text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-danger/20 animate-pulse">
                {pendingGoals.length} Action Required
              </span>
            )}
          </div>
          <p className="text-text-muted text-lg font-medium">Streamline your team's progress by reviewing goal submissions and completion requests.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit border border-slate-200/50">
        {['Pending', 'Approved', 'Rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 text-sm font-bold transition-all duration-500 rounded-xl
              ${activeTab === tab 
                ? 'bg-white text-primary shadow-xl shadow-primary/10 border border-border scale-105' 
                : 'text-text-muted hover:text-text-secondary hover:bg-white/50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        {pendingGoals.length === 0 ? (
          <div className="p-20 text-center relative z-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Clock size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Queue is Empty</h3>
            <p className="text-text-muted max-w-sm mx-auto">All team requests have been processed. Great job keeping the workflow moving!</p>
          </div>
        ) : (
          <div className="relative z-10">
            <DataTable columns={columns} data={pendingGoals} />
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-[2rem] p-8 border border-primary/10 flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-primary/5">
        <div className="p-4 bg-white rounded-2xl text-primary shadow-xl group-hover:scale-110 transition-transform duration-500 border border-primary/5">
          <Clock size={32} />
        </div>
        <div>
          <h4 className="font-black text-text-primary text-lg mb-1 tracking-tight">Review Best Practices</h4>
          <p className="text-text-secondary leading-relaxed max-w-2xl">Ensure goals align with department objectives. For completion requests, verify the quality of deliverables before final sign-off. Your feedback drives team excellence.</p>
        </div>
      </div>
    </div>
  );
};

export default Approvals;
