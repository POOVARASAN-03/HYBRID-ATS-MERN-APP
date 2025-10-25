import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AuthImagePattern from '../skeletons/AuthImagePattern';
import {toast} from 'react-toastify';
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match',{
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    if (formData.password.length < 6) {
       toast.error('Password must be at least 6 characters long',{
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      'applicant' // Force role to be applicant only
    );
    
    if (result.success) {
      navigate('/dashboard');
      toast.success('Account created successfully',{
        duration: 3000,
        position: 'top-right',
      });
    } else {
      toast.error('Registration failed',{
        duration: 3000,
        position: 'top-right',
      })
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Create Account</h1>
                  <p className="text-slate-500 text-sm sm:text-base">Get started with your applicant account</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-200 focus:outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-200 focus:outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-6">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-slate-700 font-medium hover:text-slate-800 transition-colors duration-200 underline decoration-slate-300 hover:decoration-slate-400"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title="Welcome to Hybrid ATS"
        subtitle="Sign up to manage your hiring workflow, track applicants, and collaborate efficiently."
      />
    </div>
  );
};

export default Register;
