import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
            <Link to="/dashboard" className="text-lg sm:text-xl font-bold text-gray-800">
              Hybrid ATS  
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
                  className="text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm"
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
