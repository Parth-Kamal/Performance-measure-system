import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, MoreVertical, Target, AlertTriangle, ChevronRight, Clock, CheckCircle, UserCheck, Users, Briefcase } from 'lucide-react';
import { StatusBadge, ProgressBar } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import api from '../api';

interface Goal {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending approval' | 'pending completion approval' | 'active' | 'completed' | 'archived';
  weightage: number;
  completion_pct: number;
  deadline: string;
  flag_status: 'none' | 'soft' | 'hard' | 'repeat';
  assigner_id?: string;
  assigner_name?: string;
  parent_goal_id?: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    weightage: 25,
    deadline: '',
    goal_level: 'Individual',
    parent_goal_id: '' as string | undefined
  });

  const [assignmentType, setAssignmentType] = useState<'self' | 'manager' | 'employee'>('self');
  const [reportees, setReportees] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [userRole, setUserRole] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      setGoals(res.data);
      
      const profile = await api.get('/users/me');
      const role = profile.data.role;
      setUserRole(role);
      
      if (role === 'manager' || role === 'admin') {
        const repRes = await api.get('/users/reportees');
        setReportees(repRes.data);
      }

      if (role?.toLowerCase() === 'admin') {
        const mgrRes = await api.get('/users/managers');
        setManagers(mgrRes.data);
        
        const empRes = await api.get('/users/all-employees');
        setAllEmployees(empRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (isSubmit = false) => {
    if (!newGoal.title) return alert('Title is required');
    if (newGoal.weightage < 1 || newGoal.weightage > 100) return alert('Weightage must be between 1 and 100%');
    
    // Assignment validation
    if (assignmentType !== 'self' && !selectedAssignee) {
      return alert(`Please select a ${assignmentType} to assign this goal to.`);
    }

    try {
      const payload: any = {
        ...newGoal,
        status: isSubmit ? 'pending approval' : 'draft'
      };
      
      if (assignmentType !== 'self') {
        payload.employee_id = selectedAssignee;
        // Direct assignment is active by default, draft/pending if specified
        payload.status = isSubmit ? 'active' : 'draft'; 
      }

      const res = await api.post('/goals', payload);
      
      if (isSubmit && assignmentType === 'self') {
        await api.put(`/goals/${res.data.id}/submit`);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchGoals();
    } catch (err) {
      alert('Failed to create goal');
    }
  };

  const resetForm = () => {
    setNewGoal({ title: '', description: '', weightage: 25, deadline: '', goal_level: 'Individual', parent_goal_id: '' });
    setSelectedAssignee('');
    setAssignmentType('self');
  };

  const filters = ['All', 'Draft', 'Pending Approval', 'Active', 'Completed', 'Archived'];

  const filteredGoals = goals.filter(g => {
    if (activeFilter === 'All') return true;
    return g.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleSubmitForApproval = async (id: string) => {
    try {
      await api.put(`/goals/${id}/submit`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to submit goal', err);
    }
  };

  const handleCompleteRequest = async (id: string) => {
    try {
      await api.put(`/goals/${id}/complete-request`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to request completion', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Performance Goals</h2>
          <p className="text-text-muted text-sm mt-1">Manage and track performance objectives across the organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={18} />
            Create Goal
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border
              ${activeFilter === filter 
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                : 'bg-white text-text-secondary border-border hover:border-primary/30'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGoals.map((goal) => (
          <div 
            key={goal.id} 
            className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br transition-opacity duration-500 opacity-10 group-hover:opacity-20 -mr-8 -mt-8 rounded-full blur-2xl ${
              goal.status === 'completed' ? 'from-success' : 
              goal.status.includes('pending') ? 'from-warning' : 
              'from-primary'
            }`} />

            <div className="flex items-start justify-between mb-6 relative px-2">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${
                  goal.status === 'completed' ? 'bg-success/10 text-success' : 
                  goal.status.includes('pending') ? 'bg-warning/10 text-warning' : 
                  'bg-primary/10 text-primary'
                }`}>
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors tracking-tight">{goal.title}</h3>
                  <div className="mt-1">
                    <StatusBadge status={goal.status === 'pending completion approval' ? 'Completion Review' : goal.status} />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                <button className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-primary/5 rounded-xl">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {goal.assigner_name && goal.assigner_id !== goal.employee_id && (
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-1.5 border border-slate-200">
                  <UserCheck size={12} className="text-primary" />
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">Assigned by <span className="text-primary">{goal.assigner_name}</span></span>
                </div>
              </div>
            )}

            <p className="text-text-secondary text-base leading-relaxed mb-8 line-clamp-3 min-h-[4.5rem] px-2">
              {goal.description || 'No description provided for this performance objective.'}
            </p>

            <div className="space-y-6 px-2">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-text-secondary uppercase tracking-widest text-[10px]">Weightage</span>
                  <span className="text-sm font-bold text-text-primary">{goal.weightage}%</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="font-bold text-text-secondary uppercase tracking-widest text-[10px]">Deadline</span>
                  <div className="flex items-center gap-1.5 text-text-primary font-bold text-xs">
                    <Calendar size={12} className="text-primary" />
                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-text-secondary uppercase tracking-widest text-[10px]">Progress</span>
                  <span className="font-bold text-primary text-sm">{Math.round(goal.completion_pct)}%</span>
                </div>
                <ProgressBar progress={Number(goal.completion_pct)} color={goal.status === 'completed' ? 'success' : 'primary'} />
              </div>

              <div className="pt-2">
                {goal.status === 'draft' && (
                  <button 
                    onClick={() => handleSubmitForApproval(goal.id)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 group/btn"
                  >
                    {(userRole === 'admin' || userRole === 'manager') ? 'Assign Task' : 'Submit for Approval'}
                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                )}
                
                {goal.status === 'active' && (
                  <button 
                    onClick={() => handleCompleteRequest(goal.id)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] border-2 border-success/30 text-success font-bold hover:bg-success hover:text-white hover:border-success transition-all hover:scale-[1.02] active:scale-95 group/btn"
                  >
                    <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                    Mark as Completed
                  </button>
                )}

                {goal.status === 'pending completion approval' && (
                  <div className="w-full py-4 rounded-[1.5rem] bg-warning/5 border border-warning/20 text-warning text-center text-sm font-bold flex items-center justify-center gap-2">
                    <Clock size={16} className="animate-pulse" />
                    Completion Review Pending
                  </div>
                )}

                {userRole === 'manager' && goal.status === 'active' && !goal.parent_goal_id && (
                  <button 
                    onClick={() => {
                      resetForm();
                      setNewGoal({
                        ...newGoal,
                        title: goal.title,
                        description: goal.description,
                        parent_goal_id: goal.id,
                        goal_level: 'Team'
                      });
                      setIsModalOpen(true);
                      setAssignmentType('employee'); // Managers usually cascade to employees
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
                  >
                    <Plus size={16} />
                    Cascade to Team
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Goal">
        <div className="space-y-5 px-1 py-2">
          {/* Assignment Type Selection */}
          {(userRole === 'admin' || userRole === 'manager') && (
            <div className="space-y-3">
              <label className="text-xs font-extra-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <Users size={14} className="text-primary" /> Assignment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setAssignmentType('self'); setSelectedAssignee(''); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${assignmentType === 'self' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200 text-text-muted'}`}
                >
                  <UserCheck size={20} />
                  <span className="text-[10px] font-bold">Self</span>
                </button>
                
                {userRole === 'admin' && (
                  <button 
                    onClick={() => { setAssignmentType('manager'); setSelectedAssignee(''); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${assignmentType === 'manager' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200 text-text-muted'}`}
                  >
                    <Briefcase size={20} />
                    <span className="text-[10px] font-bold">Manager</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-text-muted italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                {userRole === 'admin' ? "Admins can assign goals to managers." : "Managers can manage their own goals."}
              </p>
            </div>
          )}

          {/* Conditional Dropdowns */}
          {assignmentType === 'manager' && userRole === 'admin' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-text-secondary uppercase">Select Manager</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-inner"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
              >
                <option value="">Choose a manager...</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>
          )}


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Goal Level</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={newGoal.goal_level}
                onChange={(e) => setNewGoal({...newGoal, goal_level: e.target.value})}
              >
                <option value="Individual">Individual Goal</option>
                <option value="Team">Team Goal</option>
                <option value="Company">Company Goal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Weightage (%)</label>
              <input 
                type="number" 
                min="1" 
                max="100"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                value={newGoal.weightage}
                onChange={(e) => setNewGoal({...newGoal, weightage: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase">Goal Title</label>
            <input 
              type="text" 
              placeholder="e.g., Improve System Performance" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-inner" 
              value={newGoal.title}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase">Description</label>
            <textarea 
              rows={3} 
              placeholder="Describe the outcome..." 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-inner" 
              value={newGoal.description}
              onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase">Deadline</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button 
              onClick={() => handleCreateGoal(false)}
              className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-text-secondary hover:bg-slate-50 transition-all active:scale-95"
            >
              Save as Draft
            </button>
            <button 
              onClick={() => handleCreateGoal(true)}
              className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 transform hover:-translate-y-0.5"
            >
              {assignmentType === 'self' ? 'Submit for Approval' : 'Assign Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Goals;
