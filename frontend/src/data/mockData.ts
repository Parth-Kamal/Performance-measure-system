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

export const mockDetailedFeedback = [
  {
    id: 'f1',
    employeeName: 'Amit Sharma',
    department: 'Engineering',
    managerName: 'Rahul Malhotra',
    selfRating: 4,
    selfComment: 'I successfully led the refactor of the Auth service and exceeded my NPS goals.',
    managerRating: 4,
    managerComment: 'Amit has been a key contributor. His technical leadership on the Auth project was excellent.',
    status: 'Completed',
    timestamp: '2 days ago'
  },
  {
    id: 'f2',
    employeeName: 'Priya Verma',
    department: 'Product',
    managerName: 'Sarah Jones',
    selfRating: 5,
    selfComment: 'I delivered all product specs on time and received positive feedback from stakeholders.',
    managerRating: 2,
    managerComment: 'While specs were on time, they lacked detail and required significant rework. Needs more alignment.',
    status: 'Completed',
    timestamp: '1 week ago'
  },
  {
    id: 'f3',
    employeeName: 'Arjun Singh',
    department: 'Engineering',
    managerName: 'Rahul Malhotra',
    selfRating: 2,
    selfComment: 'I struggled with the API latency project due to overlapping priorities.',
    managerRating: 2,
    managerComment: 'Arjun missed several deadlines. We need to work on his time management and prioritization.',
    status: 'Completed',
    timestamp: '3 days ago'
  },
  {
    id: 'f4',
    employeeName: 'Kunal Kapoor',
    department: 'Marketing',
    managerName: 'Sarah Jones',
    selfRating: 3,
    selfComment: 'Satisfactory performance, but I feel I could have contributed more to the brand campaign.',
    managerRating: 3,
    managerComment: 'Kunal is a steady performer. Looking for more proactive ideas in the next cycle.',
    status: 'Completed',
    timestamp: '5 days ago'
  },
  {
    id: 'f5',
    employeeName: 'Sneha Gupta',
    department: 'Engineering',
    managerName: 'Rahul Malhotra',
    selfRating: 4,
    selfComment: 'Improved unit test coverage to 85% and mentored two junior developers.',
    managerRating: 5,
    managerComment: 'Sneha went above and beyond her goals. Her mentorship has significantly improved team velocity.',
    status: 'Completed',
    timestamp: '1 day ago'
  },
  {
    id: 'f6',
    employeeName: 'Vikram Batra',
    department: 'HR',
    managerName: 'Sarah Jones',
    selfRating: 4,
    selfComment: 'Streamlined the onboarding process for new hires.',
    managerRating: 1,
    managerComment: 'Critical errors in documentation and missed compliance check-ins. Improvement required.',
    status: 'Pending',
    timestamp: '4 days ago'
  }
];
