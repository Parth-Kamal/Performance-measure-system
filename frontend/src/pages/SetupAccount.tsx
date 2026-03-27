import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const SetupAccount = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:3000/api/auth/setup', {
        email: formData.email,
        name: formData.name,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set up account. Ensure your email is in the directory.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-slate-50 to-slate-50">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-border shadow-2xl text-center">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Account Ready!</h2>
          <p className="text-text-muted mb-8">Your profile has been updated. Redirecting you to login...</p>
          <Link to="/login" className="text-primary font-bold hover:underline">Click here if not redirected</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-slate-50 to-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-bold text-xl shadow-lg shadow-primary/20 mb-4">P</div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Set up your profile</h1>
          <p className="text-text-muted mt-2">Enter your corporate email to activate your account</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-border shadow-2xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 p-4 bg-danger/5 border border-danger/10 text-danger text-sm font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-border rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Arjun Singh"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-border rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Set Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Min. 8 characters"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-border rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Repeat password"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-border rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Activate Account <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-text-muted">
              Already have a password? <Link to="/login" className="text-primary font-bold hover:underline">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupAccount;
