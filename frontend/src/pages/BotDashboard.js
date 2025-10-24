import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const BotDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get('/bot/dashboard');
      setDashboardData(response.data.data);
    } catch (err) {
      setError('Failed to fetch bot dashboard data');
      console.error('Error fetching bot dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const runBot = async () => {
    setIsRunning(true);
    try {
      const response = await axiosInstance.post('/bot/run');
      alert(`Bot automation completed! Updated ${response.data.data.updatedCount} applications.`);
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      console.error('Error running bot:', err);
      alert('Failed to run bot automation');
    } finally {
      setIsRunning(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Bot Dashboard</h1>
        <button
          onClick={runBot}
          disabled={isRunning}
          className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Running...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>Run Bot Now</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Bot Status Cards */}
      {dashboardData?.statusCounts && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.statusCounts.map((status) => (
            <div key={status._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{status.count}</div>
                  <div className="text-sm text-gray-600">{status._id}</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status._id)}`}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Technical Applications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Technical Applications</h2>
          <p className="text-sm text-gray-600">Applications managed by bot automation</p>
        </div>
        
        <div className="p-6">
          {dashboardData?.technicalApplications?.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🤖</div>
              <p className="text-gray-500">No technical applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData?.technicalApplications?.map((application) => (
                <div key={application._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
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
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                    <Link
                      to={`/applications/${application._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bot Activity */}
      {dashboardData?.botActivity && dashboardData.botActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bot Activity</h2>
            <p className="text-sm text-gray-600">Latest automated status changes</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {dashboardData.botActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🤖</span>
                    <div>
                      <span className="font-medium text-gray-900">{activity.jobTitle}</span>
                      <div className="text-sm text-gray-600">
                        {activity.prevStatus} → {activity.newStatus}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bot Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Bot Information</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Bot runs automatically every 30 minutes</p>
          <p>• Only processes technical applications</p>
          <p>• Follows deterministic progression rules</p>
          <p>• Applied → Reviewed → Interview → Offer/Rejected</p>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Applied':
      return 'bg-blue-500';
    case 'Reviewed':
      return 'bg-yellow-500';
    case 'Interview':
      return 'bg-purple-500';
    case 'Offer':
      return 'bg-green-500';
    case 'Rejected':
      return 'bg-red-500';
    case 'Shortlisted':
      return 'bg-indigo-500';
    default:
      return 'bg-gray-500';
  }
};

export default BotDashboard;
