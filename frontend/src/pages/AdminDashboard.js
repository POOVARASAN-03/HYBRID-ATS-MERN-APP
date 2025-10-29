import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Bot } from 'lucide-react';
import { NotebookPen, Eye, BriefcaseConveyorBelt, Trophy, ChartColumnIncreasing, Speech, Pencil, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [nonTechnicalApplications, setNonTechnicalApplications] = useState([]);
  const [technicalApplications, setTechnicalApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, nonTechResponse, techResponse, jobsResponse] = await Promise.all([
        axiosInstance.get('/admin/dashboard'),
        axiosInstance.get('/admin/applications/non-technical'),
        axiosInstance.get('/admin/applications/technical'),
        axiosInstance.get('/jobs')
      ]);
      
      setStats(statsResponse.data.data);
      setNonTechnicalApplications(nonTechResponse.data.data.applications);
      setTechnicalApplications(techResponse.data.data.applications);
      setJobs(jobsResponse.data.data.jobs);
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
      // success toast
      toast.success('Application updated successfully', {
        autoClose: 3000,
        position: 'top-right',
      });
    } catch (err) {
      console.error('Error updating application:', err);
      toast.error('Failed to update application status',{
        autoClose: 3000,
        position: 'top-right',
      });
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobModal(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`/jobs/${jobId}`);
        // Refresh jobs
        const response = await axiosInstance.get('/jobs');
        setJobs(response.data.data.jobs);
        toast.success('Job deleted successfully!',{
          autoClose: 3000,
          position: 'top-right',
        });
      } catch (err) {
        console.error('Error deleting job:', err);
        toast.error('Failed to delete job posting',{
          autoClose: 3000,
          position: 'top-right',
        });
      }
    }
  };

  const handleJobSubmit = async (jobData) => {
    try {
      let res;
      if (editingJob) {
        res = await axiosInstance.put(`/jobs/${editingJob._id}`, jobData);
      } else {
        res = await axiosInstance.post('/jobs', jobData);
      }
      // success toast (use server message if present)
      toast.success(res?.data?.message || (editingJob ? 'Job posting updated successfully' : 'Job posting created successfully'), {
        autoClose: 3000,
        position: 'top-right',
      });
      
      // Refresh jobs
      const response = await axiosInstance.get('/jobs');
      setJobs(response.data.data.jobs);
      setShowJobModal(false);
      setEditingJob(null);
    } catch (err) {
      console.error('Error saving job:', err);
      toast.error('Failed to save job posting',{
        autoClose: 3000,
        position: 'top-right',
      });
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Manage applications and job postings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setEditingJob(null);
              setShowJobModal(true);
            }}
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            + Quick Create
          </button>
          <Link
            to="/admin/create-job"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium text-center"
          >
            Advanced Create
          </Link>
        </div>
      </div>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {stats.applicationStats?.find(s => s._id === 'Applied')?.count || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Applied</div>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <NotebookPen className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {stats.applicationStats?.find(s => s._id === 'Reviewed')?.count || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Reviewed</div>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Eye className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {stats.applicationStats?.find(s => s._id === 'Interview')?.count || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Interviews</div>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BriefcaseConveyorBelt className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.applicationStats?.find(s => s._id === 'Offer')?.count || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">Offers</div>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 sm:px-6 py-4 border-b">
          <div className="flex flex-wrap gap-2 sm:gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <ChartColumnIncreasing className="w-7 h-7" />
                <span>Overview</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`pb-2 px-1 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <BriefcaseConveyorBelt className="w-7 h-7" />
                <span>Jobs ({jobs.length})</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('non-technical')}
              className={`pb-2 px-1 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'non-technical'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Speech className="w-7 h-7" />
                <span>Non-Tech ({nonTechnicalApplications.length})</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`pb-2 px-1 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'technical'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Bot className="w-7 h-7" />
                <span>Technical ({technicalApplications.length})</span>
              </span>
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    <span className="flex items-center gap-2">
                      <ChartColumnIncreasing className="w-7 h-7" />
                      <span>Quick Stats</span>
                    </span>
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Total Applications: {stats?.applicationStats?.reduce((sum, s) => sum + s.count, 0) || 0}</p>
                    <p>• Active Jobs: {jobs.filter(j => j.status === 'active').length}</p>
                    <p>• Non-Technical Apps: {nonTechnicalApplications.length}</p>
                    <p>• Technical Apps: {technicalApplications.length}</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    <span className="flex items-center gap-2">
                      <ChartColumnIncreasing className="w-7 h-7" />
                      <span>Recent Activity</span>
                    </span></h3>
                  <div className="space-y-2 text-sm text-green-800">
                    {stats?.recentApplications?.slice(0, 3).map((app, index) => (
                      <p key={index}>• {app.jobTitle} - {app.status}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">
                    <span className="flex items-center gap-2">
                        <BriefcaseConveyorBelt className="w-7 h-7" />
                        <span>Jobs ({jobs.length})</span>
                    </span></div>
                  <p className="text-gray-500">No job postings found</p>
                  <Link
                    to="/admin/create-job"
                    className="mt-4 inline-block bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm font-medium"
                  >
                    Create First Job
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onEdit={handleEditJob}
                      onDelete={handleDeleteJob}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'non-technical' && (
            nonTechnicalApplications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2"><NotebookPen /></div>
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
          )}

          {activeTab === 'technical' && (
            technicalApplications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2"><Bot/></div>
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

      {/* Job Modal */}
      <JobModal
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setEditingJob(null);
        }}
        onSubmit={handleJobSubmit}
        editingJob={editingJob}
      />
    </div>
  );
};

const JobCard = ({ job, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-yellow-100 text-yellow-800',
      'closed': 'bg-red-100 text-red-800',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTypeBadge = (isTechnical) => {
    return isTechnical 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">
            {job.title}
          </h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {job.description}
          </p>
        </div>
          <div className="flex flex-col gap-1 ml-2">
          <span className={getStatusBadge(job.status)}>
            {job.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(job.isTechnical)}`}>
            <span className="flex items-center gap-1">
              {job.isTechnical ? <ChartColumnIncreasing className="w-5 h-5" /> : <Speech className="w-3 h-3" />}
              <span>{job.isTechnical ? 'Technical' : 'Non-Tech'}</span>
            </span>
          </span>
        </div>
      </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={() => onEdit(job)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil className="w-5 h-5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(job._id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete</span>
          </button>
        </div>
    </div>
  );
};

const JobModal = ({ isOpen, onClose, onSubmit, editingJob }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isTechnical: false,
    status: 'active'
  });

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        description: editingJob.description,
        isTechnical: editingJob.isTechnical,
        status: editingJob.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        isTechnical: false,
        status: 'active'
      });
    }
  }, [editingJob, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingJob ? 'Edit Job Posting' : 'Create Job Posting'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role and requirements..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isTechnical"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.isTechnical}
                onChange={handleChange}
              />
              <label className="ml-2 text-sm text-gray-900">
                Technical Role (Bot managed)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 text-sm"
              >
                {editingJob ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
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
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">{application.jobTitle}</h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Applicant: {application.applicantId?.name || 'Unknown'}
          </p>
        </div>
        <span className={getStatusBadge(application.status)}>
          {application.status}
        </span>
      </div>

      {isEditable ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Update Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="Applied">Applied</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Interview">Interview</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Comment (Optional)
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === application.status}
              className="w-full sm:w-auto bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center">
            <span className="flex items-center gap-2 text-yellow-600 text-xs sm:text-sm font-medium">
              <Bot className="w-6 h-6" />
              <span>Bot Managed</span>
            </span>
            <span className="text-yellow-600 text-xs sm:text-sm ml-2">This application is automatically processed by the bot</span>
          </div>
        </div>
      )}

      <div className="mt-3">
        <Link
          to={`/applications/${application._id}`}
          className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium"
        >
          View Full Details →
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
