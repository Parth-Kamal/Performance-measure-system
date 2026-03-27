import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, XCircle, Info, Clock, ExternalLink, MailOpen, Loader2, Filter, CheckCheck, AlertCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import api from '../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getPriorityInfo = (notification: any) => {
    const type = notification.type?.toLowerCase() || '';
    const message = notification.message?.toLowerCase() || '';
    
    // Critical (red): low ratings, employees without manager, missed deadlines
    if (type.includes('critical') || type.includes('deadline') || message.includes('low rating') || message.includes('without manager') || message.includes('missed')) {
      return { 
        category: 'critical', 
        color: 'border-red-500', 
        bg: 'bg-red-50', 
        icon: '🚩', 
        lucide: <AlertCircle size={18} className="text-red-500" />,
        accent: 'text-red-600'
      };
    }
    
    // Action Required (yellow): pending approvals, feedback not submitted, review cycles pending
    if (type.includes('pending') || type.includes('approval') || message.includes('feedback not') || message.includes('review cycle')) {
      return { 
        category: 'action', 
        color: 'border-amber-400', 
        bg: 'bg-amber-50', 
        icon: '⚠️', 
        lucide: <AlertTriangle size={18} className="text-amber-500" />,
        accent: 'text-amber-600'
      };
    }
    
    // Informational (green): goal approved/rejected, feedback submitted, performance updates
    return { 
      category: 'info', 
      color: 'border-emerald-500', 
      bg: 'bg-emerald-50', 
      icon: '✅', 
      lucide: type.includes('feedback') ? <MessageSquare size={18} className="text-emerald-500" /> : <Info size={18} className="text-emerald-500" />,
      accent: 'text-emerald-600'
    };
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'critical') return getPriorityInfo(n).category === 'critical';
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center group">
        <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
        <p className="text-text-muted font-medium animate-pulse">Synchronizing your alerts...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            Admin Notifications
          </h2>
          <p className="text-text-muted text-sm mt-1">Manage system alerts and team activity updates.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all"
            >
              <CheckCheck size={16} /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit border border-slate-200">
        {(['all', 'unread', 'critical'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200
              ${activeTab === tab 
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' 
                : 'text-text-muted hover:text-text-primary hover:bg-white/50'}`}
          >
            {tab}
            {tab === 'unread' && notifications.filter(n => !n.is_read).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-primary text-white text-[10px] rounded-full">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
            {tab === 'critical' && notifications.filter(n => getPriorityInfo(n).category === 'critical').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                {notifications.filter(n => getPriorityInfo(n).category === 'critical').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4 min-h-[300px]">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-50/50">
               <Bell className="text-emerald-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">You're all caught up!</h3>
            <p className="text-text-muted font-medium">No new notifications.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const priority = getPriorityInfo(n);
            return (
              <div 
                key={n.id} 
                className={`group bg-white rounded-2xl border transition-all duration-300 flex items-stretch gap-0 overflow-hidden relative shadow-sm hover:shadow-md
                  ${n.is_read ? 'opacity-85 grayscale-[0.2]' : 'border-slate-200'}`}
              >
                {/* Visual Priority Indicator Line */}
                <div className={`w-1.5 ${priority.category === 'critical' ? 'bg-red-500' : priority.category === 'action' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                
                <div className="p-5 flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl shadow-inner ${priority.bg} flex-shrink-0 flex items-center justify-center h-12 w-12 text-xl`}>
                    {priority.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-4">
                      <h4 className={`font-bold truncate ${n.is_read ? 'text-text-secondary' : 'text-text-primary text-lg'}`}>
                        {n.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                          {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--color-primary),0.5)]" />}
                      </div>
                    </div>
                    
                    <p className={`text-sm leading-relaxed mb-4 ${n.is_read ? 'text-text-muted' : 'text-text-secondary'}`}>
                      {n.message}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      {n.type?.includes('approval') && (
                        <button className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 shadow-sm transition-all flex items-center gap-1.5">
                           Approve
                        </button>
                      )}
                      
                      {n.message?.toLowerCase().includes('without manager') && (
                        <button className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark shadow-sm transition-all flex items-center gap-1.5">
                           Assign Manager
                        </button>
                      )}

                      {n.link && (
                        <a 
                          href={n.link} 
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                        >
                          View Details <ExternalLink size={14} />
                        </a>
                      )}
                      
                      {!n.is_read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <MailOpen size={14} /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
