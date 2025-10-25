import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { ChartColumnIncreasing } from 'lucide-react';
import { NotebookPen } from 'lucide-react';
const ApplicantDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to safely parse dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axiosInstance.get('/applications');
      setApplications(response.data.data.applications);
    } catch (err) {
      setError('Failed to fetch applications');
      toast.error('Failed to fetch applications', {
        autoClose: 3000,
        position: 'top-right',
      });
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Applied': 'status-badge status-applied',
      'Reviewed': 'status-badge status-reviewed',
      'Interview': 'status-badge status-interview',
      'Offer': 'status-badge status-offer',
      'Rejected': 'status-badge status-rejected',
      'Shortlisted': 'status-badge status-shortlisted',
    };
    return statusClasses[status] || 'status-badge bg-gray-100 text-gray-800';
  };

  const getRoleTypeBadge = (roleType) => {
    return roleType === 'technical' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Quick Stats */}
      {applications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <span className="flex items-center gap-2">
                      <ChartColumnIncreasing className="w-7 h-7" />
                      <span>Quick Stats</span>
                    </span></h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center bg-blue-50 rounded-lg p-3">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{applications.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="text-center bg-yellow-50 rounded-lg p-3">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'Applied').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Applied</div>
            </div>
            <div className="text-center bg-purple-50 rounded-lg p-3">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {applications.filter(app => app.status === 'Interview').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Interviews</div>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-3">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'Offer').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Offers</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-600 mt-1">Track your job applications and their status</p>
        </div>
        <Link
          to="/applications/create"
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm font-medium text-center"
        >
          + New Application
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4"><NotebookPen /></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">Get started by applying to a job posting</p>
          <Link
            to="/applications/create"
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            Apply Now
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                  {application.jobTitle}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getRoleTypeBadge(application.roleType)}`}>
                  {application.roleType}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                  <span className={getStatusBadge(application.status)}>
                    {application.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Applied:</span>
                  <span className="text-xs sm:text-sm text-gray-900">
                    {formatDate(application.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Comments:</span>
                  <span className="text-xs sm:text-sm text-gray-900">
                    {application.comments.length}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link
                  to={`/applications/${application._id}`}
                  className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      
    </div>
  );
};

export default ApplicantDashboard;
