import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicantDashboard from './pages/ApplicantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BotDashboard from './pages/BotDashboard';
import CreateApplication from './pages/CreateApplication';
import CreateJob from './pages/CreateJob';
import ApplicationDetail from './pages/ApplicationDetail';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                {user?.role === 'applicant' && <ApplicantDashboard />}
                {user?.role === 'admin' && <AdminDashboard />}
                {user?.role === 'bot' && <BotDashboard />}
              </ProtectedRoute>
            } />
            
            <Route path="/applications/create" element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <CreateApplication />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/create-job" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateJob />
              </ProtectedRoute>
            } />
            
            <Route path="/applications/:id" element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            } />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* 404 route */}
            <Route path="*" element={
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600">Page not found</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
