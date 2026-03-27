import React, { useState, useEffect } from 'react';
import { Shield, Flag, Clock, Users, Building, Download, MoreHorizontal, UploadCloud, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import api from '../api';
import { KPICard, StatusBadge, ProgressBar } from '../components/ui/StatusBadge';
import { DataTable } from '../components/ui/Modal';

const AdminDashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:3000/api/users/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setUploadMsg(data.message || (res.ok ? 'Upload successful' : 'Upload failed'));
    } catch (err) {
      setUploadMsg('Error uploading file');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const flaggedData = [
    { name: 'Arjun Singh', dept: 'Engineering', reason: 'Repeat Flag', cycle: 'Q1 Review', days: 12 },
    { name: 'Maya Patel', dept: 'Design', reason: 'Low Score', cycle: 'Annual Review', days: 4 },
  ];

  const probationData = [
    { name: 'Kevin Chen', doj: '2025-02-15', stage: 'Day 30', status: 'Pending', remaining: 45 },
    { name: 'Lisa Ray', doj: '2025-01-10', stage: 'Day 80', status: 'Overdue', remaining: 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Organization Control</h2>
          <p className="text-text-muted text-sm mt-1">System-wide monitoring, compliance, and final personnel decisions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-bold text-text-secondary hover:bg-slate-50 transition-all">
          <Download size={16} /> Export Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Total Employees" value={248} icon={Users} color="primary" />
        <KPICard label="Active Cycles" value={2} icon={Clock} color="indigo" />
        <KPICard label="Flags Raised" value={7} icon={Flag} color="danger" />
        <KPICard label="Forms Overdue" value={14} icon={Clock} color="warning" />
        <KPICard label="Probation Active" value={23} icon={Building} color="primary" />
      </div>

      <div className="bg-white rounded-card border border-border shadow-sm overflow-hidden p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-text-primary">Team Configuration</h3>
          <p className="text-xs text-text-muted">Assign employees to managers</p>
        </div>
        <TeamAssigner />
      </div>

      <div className="bg-white rounded-card border border-border shadow-sm overflow-hidden p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-text-primary">Employee Data Management</h3>
          <p className="text-xs text-text-muted">Upload or add personnel data</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <UploadCloud className="text-primary/50 mb-3" size={40} />
            <h4 className="font-bold text-text-primary mb-1">Bulk Excel Upload</h4>
            <p className="text-xs text-text-muted mb-4 max-w-xs">Upload an Excel or CSV file containing employee records.</p>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-bold text-text-secondary hover:bg-slate-50 cursor-pointer shadow-sm transition-all">
                Choose File
                <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileChange} />
              </label>
              <button 
                onClick={handleUploadSubmit}
                disabled={!file || uploading}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Upload Data'}
              </button>
            </div>
            {file && <p className="text-xs text-primary font-medium mt-3">Selected: {file.name}</p>}
            {uploadMsg && <p className={`text-xs font-bold mt-3 ${uploadMsg.includes('failed') || uploadMsg.includes('Error') ? 'text-danger' : 'text-success'}`}>{uploadMsg}</p>}
          </div>

          <div className="flex-1 bg-white border border-border rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-text-primary mb-4">Manual User Entry</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Full Name</label>
                  <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Jane Doe" id="manualName" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Email</label>
                  <input type="email" className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="jane@company.com" id="manualEmail" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Role</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" id="manualRole">
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Password</label>
                  <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="12345678" id="manualPass" defaultValue="12345678" />
                </div>
              </div>
              <button className="w-full py-2.5 mt-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-all" onClick={async () => {
                const nameEl = document.getElementById('manualName') as HTMLInputElement;
                const emailEl = document.getElementById('manualEmail') as HTMLInputElement;
                const roleEl = document.getElementById('manualRole') as HTMLSelectElement;
                const passEl = document.getElementById('manualPass') as HTMLInputElement;
                if (!nameEl.value || !emailEl.value) return alert('Name and Email required');
                try {
                  const res = await fetch('http://localhost:3000/api/users/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({ name: nameEl.value, email: emailEl.value, role: roleEl.value, password: passEl.value })
                  });
                  const data = await res.json();
                  if (res.status === 403) {
                    alert('❌ Access denied: You must be logged in as an Admin. Please log out and log in as yvonne.mitchell@hr.com');
                  } else if (!res.ok) {
                    alert('❌ Error: ' + (data.message || data.error || 'Unknown error'));
                  } else {
                    alert('✅ ' + data.message);
                    nameEl.value = ''; emailEl.value = ''; passEl.value = '12345678';
                  }
                } catch (e) { alert('❌ Network error: Could not reach the server'); }
              }}>Add User</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-card border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              Flagged Employees
            </h3>
            <button className="text-xs font-bold text-primary hover:underline">View All</button>
          </div>
          <DataTable 
            columns={[
              { key: 'name', label: 'Employee', render: (val) => <span className="font-bold">{val}</span> },
              { key: 'reason', label: 'Flag Reason', render: (val) => <StatusBadge status={val} /> },
              { key: 'days', label: 'Days Pending', render: (val) => <span className={val > 7 ? 'text-danger font-bold' : ''}>{val}d</span> },
              { 
                key: 'actions', 
                label: 'Action', 
                render: () => <button className="text-primary hover:bg-primary-light px-3 py-1 rounded-lg text-xs font-bold">Investigate</button>
              }
            ]} 
            data={flaggedData} 
          />
        </div>

        <div className="bg-white rounded-card border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary">Probation Tracker</h3>
            <button className="text-xs font-bold text-primary hover:underline">Full Report</button>
          </div>
          <DataTable 
            columns={[
              { key: 'name', label: 'Employee', render: (val) => <span className="font-bold">{val}</span> },
              { key: 'stage', label: 'Stage', render: (val) => <StatusBadge status={val} /> },
              { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
              { 
                key: 'actions', 
                label: 'Action', 
                render: () => (
                  <button className="text-text-secondary hover:bg-slate-100 p-1.5 rounded-lg transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                )
              }
            ]} 
            data={probationData} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 rounded-card border border-border shadow-sm group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-bold text-text-primary">Q{i} Review Cycle</h4>
                <p className="text-xs text-text-muted">Jan - Mar 2025</p>
              </div>
              <StatusBadge status="Open" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <ProgressBar progress={i * 35} />
              </div>
              <span className="text-xs font-bold text-text-primary">{i * 35}%</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 border border-border rounded-lg text-xs font-bold text-text-secondary hover:bg-slate-50">View All</button>
              <button className="flex-1 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">Export</button>
            </div>
          </div>
        ))}
        <div className="bg-slate-50 p-6 rounded-card border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <Building className="text-slate-300 mb-2" size={32} />
            <p className="text-xs font-bold text-slate-400">Launch New Cycle</p>
        </div>
      </div>
    </div>
  );
};

const TeamAssigner = () => {
  const [managers, setManagers] = useState<any[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [mgrRes, empRes] = await Promise.all([
        api.get('/users/managers'),
        api.get('/users/unassigned-employees')
      ]);
      setManagers(mgrRes.data);
      setUnassigned(empRes.data);
    } catch (err) {
      console.error('Failed to fetch team data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedManager || selectedEmployees.length === 0) {
      return alert('Please select a manager and at least one employee');
    }
    setLoading(true);
    try {
      await api.post('/users/assign-team', {
        managerId: selectedManager,
        employeeIds: selectedEmployees
      });
      alert('Team successfully formed! ✅');
      setSelectedEmployees([]);
      fetchData();
    } catch (err) {
      alert('Failed to assign team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Select Manager</label>
          <select 
            className="w-full px-3 py-2.5 bg-slate-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
          >
            <option value="">Choose a manager...</option>
            {managers.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Unassigned Employees</label>
          <div className="max-h-48 overflow-y-auto border border-border rounded-xl bg-slate-50 p-2 space-y-1">
            {unassigned.length === 0 ? (
              <p className="text-xs text-text-muted p-2">No unassigned employees found.</p>
            ) : unassigned.map(e => (
              <label key={e.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-border">
                <input 
                  type="checkbox" 
                  className="rounded text-primary focus:ring-primary/20"
                  checked={selectedEmployees.includes(e.id)}
                  onChange={(evt) => {
                    if (evt.target.checked) setSelectedEmployees([...selectedEmployees, e.id]);
                    else setSelectedEmployees(selectedEmployees.filter(id => id !== e.id));
                  }}
                />
                <div>
                  <p className="text-sm font-bold text-text-primary">{e.name}</p>
                  <p className="text-[10px] text-text-muted">{e.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={handleAssign}
        disabled={loading || !selectedManager || selectedEmployees.length === 0}
        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:transform-none"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
        Create Group & Assign Team
      </button>
    </div>
  );
};

export default AdminDashboard;
