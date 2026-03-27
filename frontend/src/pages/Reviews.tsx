import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Clock, CheckCircle2, AlertCircle, 
  Calendar, ArrowRight, Filter, Search, MoreHorizontal,
  Mail, ShieldCheck, ChevronRight, PlayCircle
} from 'lucide-react';
import api from '../api';
import { KPICard, StatusBadge, ProgressBar } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/Modal';

const Reviews = () => {
  const [activeTab, setActiveTab] = useState<'probation' | 'cycles'>('probation');
  const [probationStatus, setProbationStatus] = useState<any[]>([]);
  const [activeCycles, setActiveCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [probRes, cyclesRes] = await Promise.all([
        api.get('/reviews/probation-status'),
        api.get('/reviews/active')
      ]);
      setProbationStatus(probRes.data);
      setActiveCycles(cyclesRes.data);
    } catch (err) {
      console.error('Failed to fetch review data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProbation = probationStatus.filter(p => 
    p.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employee_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Review Management</h2>
          <p className="text-text-muted text-sm mt-1">Orchestrate performance cycles and monitor probation milestones.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold text-text-secondary hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={16} /> Schedule Cycle
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:scale-95">
            <PlayCircle size={16} /> Launch New Cycle
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Triggers" value={probationStatus.length} icon={Clock} color="primary" />
        <KPICard label="Overdue Reviews" value={probationStatus.filter(p => !p.self_submitted || !p.manager_submitted).length} icon={AlertCircle} color="danger" />
        <KPICard label="Compliance Rate" value="92%" icon={ShieldCheck} color="success" />
        <KPICard label="Total Cycles" value={activeCycles.length} icon={ClipboardList} color="indigo" />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[24px] border border-border shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Tabs Bar */}
        <div className="flex items-center px-6 border-b border-border bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('probation')}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === 'probation' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            Probation Monitoring
            {activeTab === 'probation' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
          </button>
          <button 
            onClick={() => setActiveTab('cycles')}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === 'cycles' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            Review Cycles
            {activeTab === 'cycles' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />}
          </button>
          
          <div className="flex-1" />
          
          <div className="relative mr-4 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input 
              type="text"
              placeholder="Filter by name..."
              className="pl-9 pr-4 py-1.5 bg-white border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none w-48 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 text-text-muted hover:bg-slate-100 rounded-lg transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="p-0 flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-primary animate-pulse">Syncing organizational data...</p>
              </div>
            </div>
          ) : activeTab === 'probation' ? (
            <DataTable 
              columns={[
                { 
                    key: 'employee_name', 
                    label: 'Employee', 
                    render: (val, row) => (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-text-secondary uppercase">
                          {val.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">{val}</p>
                          <p className="text-[10px] text-text-muted">{row.employee_email}</p>
                        </div>
                      </div>
                    )
                },
                { 
                  key: 'trigger_day', 
                  label: 'Stage', 
                  render: (val) => (
                    <div className="flex items-center gap-2">
                        <StatusBadge status={`Day ${val}`} />
                        <span className="text-[10px] text-text-muted">Assessment</span>
                    </div>
                  )
                },
                { 
                  key: 'self_submitted', 
                  label: 'Self-Review', 
                  render: (val) => val ? <StatusBadge status="Completed" /> : <StatusBadge status="Pending" />
                },
                { 
                  key: 'manager_submitted', 
                  label: 'Manager Link', 
                  render: (val) => val ? <StatusBadge status="Finalized" /> : <StatusBadge status="Reviewing" />
                },
                { 
                    key: 'scheduled_date', 
                    label: 'Deadline', 
                    render: (val) => {
                        const date = new Date(val);
                        const today = new Date();
                        const isOverdue = date < today;
                        return (
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold ${isOverdue ? 'text-danger' : 'text-text-primary'}`}>
                                    {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </span>
                                {isOverdue && <span className="text-[9px] text-danger font-medium uppercase tracking-tighter">Action Required</span>}
                            </div>
                        )
                    }
                },
                { 
                  key: 'actions', 
                  label: '', 
                  render: () => (
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-text-muted hover:bg-slate-100 rounded-lg transition-all group relative">
                            <Mail size={16} className="group-hover:text-primary" />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all shadow-xl">Send Nudge</span>
                        </button>
                        <button className="p-2 text-text-muted hover:bg-slate-100 rounded-lg transition-all group relative">
                            <ArrowRight size={16} className="group-hover:text-primary" />
                             <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all shadow-xl">Go to Form</span>
                        </button>
                    </div>
                  )
                }
              ]} 
              data={filteredProbation} 
            />
          ) : (
            <div className="p-8 space-y-6">
              {activeCycles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <ClipboardList size={48} className="text-slate-200 mb-4" />
                    <h4 className="text-lg font-bold text-slate-400">No active review cycles</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-2">Initialize a new biannual or quarterly performance tracking cycle to begin monitoring compliance.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeCycles.map((cycle) => (
                        <div key={cycle.id} className="p-6 bg-white border border-border rounded-[24px] hover:shadow-xl hover:shadow-primary/5 transition-all group border-l-4 border-l-primary">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-text-primary text-lg">{cycle.period_label}</h4>
                                        <StatusBadge status={cycle.status} />
                                    </div>
                                    <p className="text-xs text-text-muted uppercase tracking-widest font-bold opacity-60">{cycle.type} Strategy</p>
                                </div>
                                <button className="p-2 text-text-muted hover:bg-slate-100 rounded-lg transition-all">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                            
                            <div className="space-y-4 mb-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-text-secondary">Completion Progress</span>
                                        <span className="text-primary">68%</span>
                                    </div>
                                    <ProgressBar progress={68} />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Self-Reviews</p>
                                        <p className="text-lg font-black text-text-primary">142/248</p>
                                    </div>
                                    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Manager-Finals</p>
                                        <p className="text-lg font-black text-text-primary">98/248</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                                    Track Compliance <ChevronRight size={16} />
                                </button>
                                <button className="px-4 py-3 bg-white border border-border rounded-xl text-sm font-bold text-text-secondary hover:bg-slate-50 transition-all">
                                    Close Cycle
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[20px] text-white shadow-2xl">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-primary-light" />
            </div>
            <div>
                <h5 className="font-bold text-sm">Automated Escalate Protocol</h5>
                <p className="text-[11px] text-slate-400">Managers will be auto-notified 48h after missing probation deadlines.</p>
            </div>
        </div>
        <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all border border-white/10">Configure Rules</button>
      </div>
    </div>
  );
};

export default Reviews;
