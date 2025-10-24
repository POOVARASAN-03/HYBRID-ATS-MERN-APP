import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const CreateApplication = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get('/jobs?status=active');
      setJobs(response.data.data.jobs);
    } catch (err) {
      setError('Failed to fetch job postings');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobId) return;

    setSubmitting(true);
    setError('');

    try {
      await axiosInstance.post('/applications', {
        jobId: selectedJobId
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create application');
      console.error('Error creating application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Application</h1>
        <p className="text-gray-600 mt-2">Select a job posting to apply for</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="jobId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Job Posting
          </label>
          <select
            id="jobId"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Choose a job posting...</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} {job.isTechnical ? '(Technical)' : '(Non-Technical)'}
              </option>
            ))}
          </select>
        </div>

        {selectedJobId && (
          <JobDetails job={jobs.find(job => job._id === selectedJobId)} />
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedJobId || submitting}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Application...' : 'Create Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

const JobDetails = ({ job }) => {
  if (!job) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Type:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.isTechnical 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {job.isTechnical ? 'Technical' : 'Non-Technical'}
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-600">Description:</span>
          <p className="text-sm text-gray-900 mt-1">{job.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Created:</span>
          <span className="text-sm text-gray-900">
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreateApplication;
