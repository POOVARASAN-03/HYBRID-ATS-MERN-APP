import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [nonTechnicalApplications, setNonTechnicalApplications] = useState([]);
  const [technicalApplications, setTechnicalApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState('non-technical');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, nonTechResponse, techResponse] = await Promise.all([
        axiosInstance.get('/admin/dashboard'),
        axiosInstance.get('/admin/applications/non-technical'),
        axiosInstance.get('/admin/applications/technical')
      ]);
      
      setStats(statsResponse.data.data);
      setNonTechnicalApplications(nonTechResponse.data.data.applications);
      setTechnicalApplications(techResponse.data.data.applications);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status, comment) => {
    try {
      await axiosInstance.put(`/admin/applications/${applicationId}`, {
        status,
        comment
      });
      
      // Refresh applications
      const response = await axiosInstance.get('/admin/applications/non-technical');
      setNonTechnicalApplications(response.data.data.applications);
    } catch (err) {
      console.error('Error updating application:', err);
      alert('Failed to update application status');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link
          to="/admin/create-job"
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
        >
          Create Job Posting
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.applicationStats?.find(s => s._id === 'Applied')?.count || 0}
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-1">Applied</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.applicationStats?.find(s => s._id === 'Reviewed')?.count || 0}
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-1">Reviewed</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.applicationStats?.find(s => s._id === 'Interview')?.count || 0}
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-1">Interviews</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.applicationStats?.find(s => s._id === 'Offer')?.count || 0}
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-1">Offers</div>
          </div>
        </div>
      )}

      {/* Applications Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('non-technical')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'non-technical'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Non-Technical Applications (Manage)
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'technical'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Technical Applications (View Only)
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'non-technical' ? (
            nonTechnicalApplications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <p className="text-gray-500">No non-technical applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nonTechnicalApplications.map((application) => (
                  <ApplicationCard
                    key={application._id}
                    application={application}
                    onStatusUpdate={updateApplicationStatus}
                    getStatusBadge={getStatusBadge}
                    isEditable={true}
                  />
                ))}
              </div>
            )
          ) : (
            technicalApplications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🤖</div>
                <p className="text-gray-500">No technical applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {technicalApplications.map((application) => (
                  <ApplicationCard
                    key={application._id}
                    application={application}
                    onStatusUpdate={() => {}} // No update function for technical
                    getStatusBadge={getStatusBadge}
                    isEditable={false}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationCard = ({ application, onStatusUpdate, getStatusBadge, isEditable = true }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(application.status);
  const [comment, setComment] = useState('');

  const handleStatusUpdate = async () => {
    if (newStatus === application.status) return;
    
    setIsUpdating(true);
    await onStatusUpdate(application._id, newStatus, comment);
    setIsUpdating(false);
    setComment('');
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{application.jobTitle}</h3>
          <p className="text-sm text-gray-600">
            Applicant: {application.applicantId?.name || 'Unknown'}
          </p>
        </div>
        <span className={getStatusBadge(application.status)}>
          {application.status}
        </span>
      </div>

      {isEditable ? (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Applied">Applied</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Interview">Interview</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (Optional)
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === application.status}
              className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center">
            <span className="text-yellow-600 text-sm font-medium">🤖 Bot Managed</span>
            <span className="text-yellow-600 text-sm ml-2">This application is automatically processed by the bot</span>
          </div>
        </div>
      )}

      <div className="mt-3">
        <Link
          to={`/applications/${application._id}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View Full Details →
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
