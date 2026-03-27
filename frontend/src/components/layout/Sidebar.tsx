import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Target, MessageSquare, ClipboardList, 
  CheckSquare, Users, Shield, Settings, LogOut, Bell
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { role } = useRole();
  const { logout, user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['employee', 'manager', 'admin'] },
    { icon: Bell, label: 'Notifications', path: '/notifications', roles: ['employee', 'manager', 'admin'] },
    { icon: Target, label: 'Goals', path: '/goals', roles: ['employee', 'manager', 'admin'] },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback', roles: ['employee', 'manager', 'admin'] },
    { icon: ClipboardList, label: 'Reviews', path: '/reviews', roles: ['employee', 'manager', 'admin'] },
    { icon: CheckSquare, label: 'Approvals', path: '/approvals', roles: ['manager', 'admin'], badge: 0 },
    { icon: Users, label: 'My Team', path: '/team', roles: ['employee', 'manager', 'admin'] },
    { icon: Shield, label: 'Admin Panel', path: '/admin', roles: ['admin'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['employee', 'manager', 'admin'] },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-border flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">P</div>
        <span className="text-xl font-bold text-text-primary tracking-tight">PMS</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.filter(item => item.roles.includes(role)).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'text-text-secondary hover:bg-primary-light hover:text-primary'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
            {item.badge && (
              <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold ${role === 'manager' ? 'bg-danger text-white' : 'bg-primary-light text-primary'}`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold overflow-hidden">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=EEF2FF&color=6366F1`} alt="avatar" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{role}</p>
          </div>
          <button 
            onClick={logout}
            className="text-text-muted hover:text-danger flex-shrink-0 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
