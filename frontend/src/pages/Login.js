import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import AuthImagePattern from '../skeletons/AuthImagePattern';
import {toast} from 'react-toastify';
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Login successful',{
        duration: 3000,
        position: 'top-right',
      });
      navigate('/dashboard');
    } else {
      toast.error('Invaild Credentials',{
        duration: 5000,
        position: 'top-right',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12 min-h-screen py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] p-6 sm:p-8 lg:p-10 mx-auto mb-8">
          <div className="space-y-6">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-slate-200 group-hover:scale-110">
                <Mail className="w-8 h-8 text-slate-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Welcome Back</h1>
                <p className="text-slate-500 text-sm sm:text-base">Sign in to your account</p>
              </div>
            </div>
          </div>
  
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-200 focus:outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
    
              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-200 focus:outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-slate-100 rounded-r-xl transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
    
              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
  
            {/* Signup Link */}
            <div className="text-center pt-4">
              <p className="text-slate-500 text-sm">
                Don&apos;t have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-slate-700 font-medium hover:text-slate-800 transition-colors duration-200 underline decoration-slate-300 hover:decoration-slate-400"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
  
      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
      title="Welcome to Hybrid ATS"
      subtitle="Sign in to manage your hiring workflow, track applicants, and collaborate efficiently."
    />
    </div>
  );
};

export default Login;
