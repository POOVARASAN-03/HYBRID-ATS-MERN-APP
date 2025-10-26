import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, logout } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        setValid(false);
        setVerifying(false);
        return;
      }

      try {
        // Ping your existing protected endpoint
        const res = await axiosInstance.get('/auth/profile');
        if (res.status === 200 && res.data.success) {
          setValid(true);
        } else {
          logout();
          setValid(false);
        }
      } catch (error) {
        logout(); // clears token and user from storage
        setValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [logout]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || !valid) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-gray-600 mb-4">
            Access denied. You don't have permission to view this page.
          </p>
          <p className="text-sm text-gray-500">
            Required role: {allowedRoles.join(' or ')}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
