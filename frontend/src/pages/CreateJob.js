import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {toast} from 'react-toastify';
import { Bot, User } from 'lucide-react';
const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isTechnical: false,
    status: 'active'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // show success only after the API call succeeds
    setLoading(true);

    try {
      await axiosInstance.post('/jobs', formData);
      toast.success('Job created successfully', {
        autoClose: 3000,
        position: 'top-right',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job posting');
      toast.error('Failed to create job posting',{
        autoClose: 3000,
        position: 'top-right',
      });
      console.error('Error creating job:', err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Job Posting</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Create a new job role for applicants</p>
      </div>

      {error &&toast.error(error, {
        autoClose: 3000,
        position: 'top-right',
      })}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
            placeholder="e.g., Senior Software Engineer"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
            placeholder="Describe the role, responsibilities, and requirements..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center">
          <input
            id="isTechnical"
            name="isTechnical"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={formData.isTechnical}
            onChange={handleChange}
          />
          <label htmlFor="isTechnical" className="ml-2 block text-sm text-gray-900">
            Technical Role (will be processed by Bot)
          </label>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Role Classification:</h3>
          <div className="text-xs sm:text-sm text-blue-800">
            {formData.isTechnical ? (
              <div>
                <p className="font-medium">
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>Technical Role</span>
                  </span>
                </p>
                <p>• Will be automatically processed by Bot</p>
                <p>• Status progression: Applied → Reviewed → Interview → Offer/Rejected</p>
                <p>• Admin can view but cannot manually update</p>
              </div>
            ) : (
              <div>
                <p className="font-medium">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Non-Technical Role</span>
                  </span>
                </p>
                <p>• Will be manually managed by Admin</p>
                <p>• Admin can update status and add comments</p>
                <p>• Full manual control and audit trail</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? 'Creating Job...' : 'Create Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;

