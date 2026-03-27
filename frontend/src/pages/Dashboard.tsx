import React from 'react';
import { 
  Target, CheckCircle, Clock, TrendingUp, Calendar, CheckSquare, MessageSquare, Bell, AlertTriangle 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { KPICard, ProgressBar, StatusBadge } from '../components/ui/StatusBadge';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#94A3B8'];

const EmployeeDashboard = () => {
  const chartData = [
    { name: 'Jan', score: 65 },
    { name: 'Feb', score: 72 },
    { name: 'Mar', score: 68 },
    { name: 'Apr', score: 78 },
    { name: 'May', score: 75 },
    { name: 'Jun', score: 82 },
  ];

  const statusData = [
    { name: 'Active', value: 4 },
    { name: 'Completed', value: 3 },
    { name: 'Pending', value: 2 },
    { name: 'Draft', value: 1 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark p-8 rounded-card text-white shadow-lg shadow-primary/20">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 tracking-tight">Good morning, Arjun 👋</h2>
          <p className="text-white/80 font-medium">Here's your performance snapshot for the Q2 Review Cycle.</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl font-bold italic text-9xl leading-none">PMS</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard label="Total Goals" value={8} icon={Target} trend="+2 from Q1" trendUp={true} color="primary" />
        <KPICard label="Completed Goals" value={3} icon={CheckCircle} trend="100% on time" trendUp={true} color="success" />
        <KPICard label="Pending Approvals" value={2} icon={Clock} trend="Submitted 2h ago" trendUp={true} color="warning" />
        <KPICard label="Performance Score" value="78%" icon={TrendingUp} trend="+12% vs last cycle" trendUp={true} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-card border border-border shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-6">Monthly Performance Score</h3>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#6366F1', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={4} dot={{ r: 6, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h3>
            <div className="space-y-6 mt-6">
              {[
                { icon: CheckSquare, color: 'text-success', bg: 'bg-success/10', text: "Goal 'Improve Customer NPS' was approved", time: "2h ago" },
                { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10', text: "Manager submitted feedback for Q1 Review", time: "Yesterday" },
                { icon: Bell, color: 'text-warning', bg: 'bg-warning/10', text: "Probation Day 30 form is due in 3 days", time: "2 days ago" },
                { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10', text: "Goal 'Launch Feature X' rejected — needs revision", time: "3 days ago" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 border-b border-border pb-4 last:border-0">
                    <p className="text-sm font-semibold text-text-primary mb-1">{item.text}</p>
                    <p className="text-xs text-text-muted">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-card border border-border shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-6">Goals by Status</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-4">Probation Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-text-primary">Day 30 Check-in</span>
                <StatusBadge status="Due in 5 days" />
              </div>
              <ProgressBar progress={37.5} label="30 of 80 days completed" />
              <button className="w-full mt-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:scale-95">
                Submit Self-Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
