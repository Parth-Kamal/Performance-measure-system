import React from 'react';
import { User, Bell, Shield, Laptop, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { logout } = useAuth();
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h2>
        <p className="text-text-muted text-sm mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          {[
            { icon: User, label: 'Profile' },
            { icon: Bell, label: 'Notifications' },
            { icon: Shield, label: 'Security' },
            { icon: Laptop, label: 'Display' },
          ].map((item, i) => (
            <button key={i} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${i === 0 ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-slate-50'}`}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-8">
          <div className="bg-white rounded-card border border-border shadow-sm p-8">
            <h3 className="text-lg font-bold text-text-primary mb-6">General Information</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold text-2xl overflow-hidden border border-primary/10 shadow-inner">
                   <img src="https://ui-avatars.com/api/?name=Arjun+Singh&background=EEF2FF&color=6366F1" alt="avatar" />
                </div>
                <div className="space-y-2">
                  <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-all">Upload New Photo</button>
                  <p className="text-[10px] text-text-muted">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                  <input type="text" defaultValue="Arjun Singh" className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                  <input type="email" defaultValue="arjun.s@company.com" disabled className="w-full px-4 py-2.5 bg-slate-100 border border-border rounded-lg text-sm text-text-muted cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Department</label>
                  <input type="text" defaultValue="Engineering" disabled className="w-full px-4 py-2.5 bg-slate-100 border border-border rounded-lg text-sm text-text-muted cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Employee ID</label>
                    <input type="text" defaultValue="PMS-0042" disabled className="w-full px-4 py-2.5 bg-slate-100 border border-border rounded-lg text-sm text-text-muted cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button className="px-6 py-2 border border-border rounded-lg text-sm font-bold text-text-secondary hover:bg-slate-50 transition-all">Cancel</button>
                <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">Save Changes</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-border shadow-sm p-8">
            <h3 className="text-lg font-bold text-text-primary mb-6">Security</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Two-Factor Authentication</p>
                    <p className="text-xs text-text-muted">Add an extra layer of security to your account.</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer group">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all group-hover:left-7" />
                  </div>
               </div>
               <button 
                 onClick={logout}
                 className="text-danger text-sm font-bold flex items-center gap-2 hover:underline"
               >
                 <LogOut size={16} /> Sign out from all devices
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
