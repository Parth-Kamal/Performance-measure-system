import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, token } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      login(response.data.token, response.data.user);
      // navigation handled by useEffect
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-slate-50 to-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-primary/10 border border-slate-100 mb-6 transform hover:scale-105 transition-transform">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">P</div>
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Welcome back</h1>
          <p className="text-text-muted mt-2">Log in to your PMS account</p>
        </div>

        <div className="bg-white p-10 rounded-3xl border border-border shadow-2xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 p-4 bg-danger/5 border border-danger/10 text-danger text-sm font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
             <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Demo Access</p>
             <p className="text-xs text-text-secondary font-medium">Email: <span className="font-bold text-text-primary">admin@pms.com</span></p>
             <p className="text-xs text-text-secondary font-medium">Pass: <span className="font-bold text-text-primary">Password@123</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-border rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-border rounded-xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none focus:bg-white transition-all"
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
                  Sign In <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-text-muted">
              First time logging in? <Link to="/setup-account" className="text-primary font-bold hover:underline">Set up your account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
