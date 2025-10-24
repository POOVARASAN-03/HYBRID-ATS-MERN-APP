import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import StatusTimeline from '../components/StatusTimeline';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await axiosInstance.get(`/applications/${id}`);
      setApplication(response.data.data.application);
    } catch (err) {
      setError('Failed to fetch application details');
      console.error('Error fetching application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await axiosInstance.post(`/applications/${id}/comments`, {
        text: newComment
      });
      
      setNewComment('');
      // Refresh application data
      await fetchApplication();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
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

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
        <p className="text-gray-600 mb-4">{error || 'The application you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{application.jobTitle}</h1>
          <p className="text-gray-600 mt-1">
            Application by {application.applicantId?.name || 'Unknown'}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Application Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={getStatusBadge(application.status)}>
                  {application.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleTypeBadge(application.roleType)}`}>
                  {application.roleType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Applied:</span>
                <span className="text-gray-900">
                  {new Date(application.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">
                  {new Date(application.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Job Title:</span>
                <p className="text-gray-900">{application.jobId?.title || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="text-gray-900 text-sm mt-1">
                  {application.jobId?.description || 'No description available'}
                </p>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Job Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  application.jobId?.isTechnical 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {application.jobId?.isTechnical ? 'Technical' : 'Non-Technical'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <StatusTimeline history={application.history} />
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
        
        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingComment ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {application.comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          ) : (
            application.comments.map((comment, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{comment.by}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      comment.role === 'admin' ? 'bg-red-100 text-red-800' :
                      comment.role === 'bot' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {comment.role}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.date).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
