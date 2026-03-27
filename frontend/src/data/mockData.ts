export const mockUsers = [
  { id: '1', name: 'Arjun Singh', role: 'employee', avatar: 'https://i.pravatar.cc/150?u=arjun', department: 'Engineering' },
  { id: '2', name: 'Rahul Malhotra', role: 'manager', avatar: 'https://i.pravatar.cc/150?u=rahul', department: 'Engineering' },
  { id: '3', name: 'Sarah Jones', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=sarah', department: 'HR' },
];

export const mockGoals = [
  { id: '1', title: 'Improve Customer NPS', status: 'active', weightage: 30, completion: 75, deadline: '2025-06-30' },
  { id: '2', title: 'Refactor Auth Service', status: 'completed', weightage: 20, completion: 100, deadline: '2025-03-15' },
  { id: '3', title: 'Onboard 3 New Engineers', status: 'pending approval', weightage: 15, completion: 20, deadline: '2025-05-20' },
  { id: '4', title: 'Reduce API Latency by 50ms', status: 'draft', weightage: 25, completion: 0, deadline: '2025-08-01' },
];

export const mockNotifications = [
  { id: '1', type: 'success', message: 'Goal "Improve NPS" was approved', time: '2h ago' },
  { id: '2', type: 'warning', message: 'Probation Day 30 form is due', time: '1d ago' },
  { id: '3', type: 'info', message: 'Manager submitted Q1 feedback', time: '2d ago' },
];

export const mockFeedback = [
  { id: '1', cycle: 'Q1 Review', date: '2025-03-01', rating: 4, status: 'completed' },
  { id: '2', cycle: 'Annual Review 2024', date: '2024-12-15', rating: 5, status: 'completed' },
];
