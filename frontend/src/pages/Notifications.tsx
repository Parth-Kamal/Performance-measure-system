import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, XCircle, Info, Clock, ExternalLink, MailOpen, Loader2 } from 'lucide-react';
import api from '../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getIcon = (type: string) => {
    switch (type) {
      case 'team_assignment': return <Info className="text-primary" size={20} />;
      case 'goal_approved': return <CheckCircle2 className="text-success" size={20} />;
      case 'goal_rejected': return <XCircle className="text-danger" size={20} />;
      case 'goal_submission': return <Clock className="text-warning" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Notifications</h2>
          <p className="text-text-muted text-sm mt-1">Stay updated with your team's activity and goal status.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-text-muted uppercase px-3 py-1 bg-slate-100 rounded-full">
             {notifications.filter(n => !n.is_read).length} Unread
           </span>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Bell className="text-slate-300" size={32} />
            </div>
            <p className="text-text-muted font-medium">No notifications yet.</p>
          </div>
        ) : notifications.map((n) => (
          <div 
            key={n.id} 
            className={`group bg-white rounded-2xl border transition-all p-5 flex items-start gap-4 relative
              ${n.is_read ? 'border-border/50 opacity-75' : 'border-primary/20 shadow-sm shadow-primary/5 hover:border-primary/40'}`}
          >
            {!n.is_read && <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full animate-pulse" />}
            
            <div className={`p-3 rounded-xl ${n.is_read ? 'bg-slate-50' : 'bg-primary/5'}`}>
              {getIcon(n.type)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-bold ${n.is_read ? 'text-text-secondary' : 'text-text-primary'}`}>
                  {n.title}
                </h4>
                <span className="text-[10px] font-bold text-text-muted uppercase">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {n.message}
              </p>
              
              <div className="flex items-center gap-3">
                {n.link && (
                  <a 
                    href={n.link} 
                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline transition-all"
                  >
                    View Details <ExternalLink size={12} />
                  </a>
                )}
                {!n.is_read && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-primary transition-all"
                  >
                    Mark as read <MailOpen size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
