import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Album } from 'lucide-react';
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'bot':
        return 'bg-purple-100 text-purple-800';
      case 'applicant':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl sm:text-2xl font-bold text-slate-800">
              <span className="flex items-center gap-2">
                {/* inline notebook-pen SVG sized to match text (1em) and colored black */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"> 
                  <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/>
                  <path d="M2 6h4"/>
                  <path d="M2 10h4"/>
                  <path d="M2 14h4"/>
                  <path d="M2 18h4"/>
                  <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
                </svg>
                <span>Hybrid ATS</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex sm:hidden items-center space-x-1">
                  <span className="text-xs text-gray-600">{user.name}</span>
                  <span className={`px-1 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-base"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-slate-700 transition-colors text-base"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
