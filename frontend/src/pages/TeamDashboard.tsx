import React, { useState, useEffect } from 'react';
import { Users, Target, CheckCircle, TrendingUp, Search, User, Mail, Shield, Loader2 } from 'lucide-react';
import { KPICard, StatusBadge, ProgressBar } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/Modal';
import api from '../api';
import { useRole } from '../context/RoleContext';

const TeamDashboard = () => {
  const { role } = useRole();
  const [teamData, setTeamData] = useState<any[]>([]);
  const [manager, setManager] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      if (role === 'admin' || role === 'manager') {
        const res = await api.get('/users/reportees');
        setTeamData(res.data);
      } else {
        const res = await api.get('/users/team');
        setManager(res.data.manager);
        setTeamData(res.data.teammates);
      }
    } catch (err) {
      console.error('Failed to fetch team data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [role]);

  const columns = [
    { 
      key: 'name', 
      label: 'Member',
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs uppercase">
            {val ? val.split(' ').map(n => n[0]).join('') : '?'}
          </div>
          <div>
            <p className="font-bold text-text-primary">{val}</p>
            <p className="text-[10px] text-text-muted">Engineering</p>
          </div>
        </div>
      )
    },
    { key: 'role', label: 'Role', render: (val: string) => <span className="capitalize">{val}</span> },
    { key: 'email', label: 'Email' },
    { 
      key: 'status', 
      label: 'Status',
      render: () => <StatusBadge status="Active" />
    }
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          {role === 'employee' ? 'My Team' : 'Team Overview'}
        </h2>
        <p className="text-text-muted text-sm mt-1">
          {role === 'employee' ? 'Collaborate with your manager and teammates.' : 'Monitor performance and track goal progress across your primary group.'}
        </p>
      </div>

      {role === 'employee' && manager && (
        <div className="bg-white rounded-[2.5rem] border border-primary/10 p-10 shadow-2xl shadow-primary/5 flex items-center justify-between group relative overflow-hidden transition-all duration-500 hover:shadow-primary/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-primary/10 rounded-[2rem] text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Shield size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Primary Reporting Manager</p>
              <h4 className="text-3xl font-black text-text-primary tracking-tight">{manager.name}</h4>
              <div className="flex items-center gap-6 mt-3">
                <span className="flex items-center gap-2 text-sm text-text-secondary font-medium bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                  <Mail size={14} className="text-primary" /> {manager.email}
                </span>
                <span className="flex items-center gap-2 text-sm text-success font-bold bg-success/5 px-4 py-1.5 rounded-full border border-success/10">
                  <CheckCircle size={14} /> Available
                </span>
              </div>
            </div>
          </div>
          <button className="px-8 py-4 bg-primary text-white rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all relative z-10">
            Send Message
          </button>
        </div>
      )}

      {(role === 'manager' || role === 'admin') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <KPICard label="Team Members" value={teamData.length} icon={Users} color="primary" />
          <KPICard label="Goals Submitted" value={12} icon={Target} color="indigo" />
          <KPICard label="Approval Pending" value={2} icon={CheckCircle} color="warning" />
          <KPICard label="Avg Team Score" value="82%" icon={TrendingUp} color="success" />
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden group">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-b from-slate-50/50 to-white">
          <div>
            <h3 className="text-2xl font-black text-text-primary tracking-tight">
              {role === 'employee' ? 'Team Directory' : 'Performance Matrix'}
            </h3>
            <p className="text-text-muted text-sm font-medium mt-1">
              {role === 'employee' ? 'Connect with your teammates and collaborate.' : 'Real-time performance distribution across your reportees.'}
            </p>
          </div>
          <div className="relative group/search max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within/search:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search member by name..." 
              className="w-full pl-12 pr-6 py-3 bg-slate-50/50 border border-border rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all outline-none" 
            />
          </div>
        </div>
        <div className="p-2">
          {teamData.length === 0 ? (
            <div className="p-20 text-center text-text-muted font-bold bg-slate-50/30 rounded-[2rem] m-6 border-2 border-dashed border-slate-200">
              No team members found currently.
            </div>
          ) : (
            <DataTable columns={columns} data={teamData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
