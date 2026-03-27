import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronDown, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { role } = useRole();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      const unread = res.data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-60 h-16 bg-white/80 backdrop-blur-md border-b border-border z-40 px-8 flex items-center justify-between">
      <h1 className="text-xl font-bold text-text-primary capitalize">{title.replace('/', '').replace('-', ' ')}</h1>
      
      <div className="flex-1 max-w-md mx-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search goals, employees..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 text-text-secondary hover:bg-slate-100 rounded-full transition-all relative group"
          >
            <Bell size={20} className="group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-border group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-bold text-text-primary">{user?.name || 'User'}</p>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-tighter">{role || 'Role'}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary overflow-hidden border border-indigo-100 group-hover:shadow-md transition-all">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=EEF2FF&color=6366F1`} alt="avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
