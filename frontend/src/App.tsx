import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import LayoutWrapper from './components/layout/LayoutWrapper';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Feedback from './pages/Feedback';
import Approvals from './pages/Approvals';
import TeamDashboard from './pages/TeamDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SetupAccount from './pages/SetupAccount';
import Notifications from './pages/Notifications';
import Reviews from './pages/Reviews';

const Placeholder = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-muted">
    <div className="text-4xl font-bold mb-4 opacity-20 capitalize">{name} Page</div>
    <p>Coming Soon...</p>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <RoleProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/setup-account" element={<SetupAccount />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><LayoutWrapper><Dashboard /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><LayoutWrapper><Goals /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><LayoutWrapper><Feedback /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/approvals" element={<ProtectedRoute><LayoutWrapper><Approvals /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><LayoutWrapper><TeamDashboard /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><LayoutWrapper><AdminDashboard /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><LayoutWrapper><Settings /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><LayoutWrapper><Notifications /></LayoutWrapper></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><LayoutWrapper><Reviews /></LayoutWrapper></ProtectedRoute>} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </RoleProvider>
    </AuthProvider>
  );
};

export default App;
