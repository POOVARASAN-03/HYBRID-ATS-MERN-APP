import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Briefcase, Clock, Users, CheckCircle, ArrowRight, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import {toast} from 'react-toastify';
const CreateApplication = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get('/jobs?status=active');
      const jobsData = response.data.data.jobs;
      // Remove duplicates based on job ID
      const uniqueJobs = jobsData.filter((job, index, self) => 
        index === self.findIndex(j => j._id === job._id)
      );
      setJobs(uniqueJobs);
      console.log('Fetched jobs:', uniqueJobs.length, 'unique jobs');
    } catch (err) {
      setError('Failed to fetch job postings');
      toast.error('Failed to fetch job postings',{
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    setSubmitting(true);
    setError('');

    try {
      await axiosInstance.post('/applications', {
        jobId: jobId
      });
      toast.success('Application submitted successfully',{
        duration: 3000,
        position: 'top-right',
      })
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create application');
      console.error('Error creating application:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpanded = (jobId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Available Positions</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover exciting career opportunities and apply for positions that match your skills and interests.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Job Cards Grid */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Job Openings</h3>
            <p className="text-slate-500">There are currently no job openings available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {jobs.map((job, index) => (
              <div key={`${job._id}-${index}`} className="w-full">
                <JobCard 
                  job={job} 
                  onApply={handleApply} 
                  submitting={submitting}
                  isExpanded={expandedCards.has(job._id)}
                  onToggleExpanded={() => toggleExpanded(job._id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ job, onApply, submitting, isExpanded, onToggleExpanded }) => {

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{job.title}</h3>
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.isTechnical 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {job.isTechnical ? 'Technical' : 'Non-Technical'}
              </span>
            </div>
          </div>
          <Briefcase className="w-8 h-8 text-slate-400 flex-shrink-0" />
        </div>
        
        {/* Job Description */}
        <div className="space-y-3">
          <p className={`text-slate-600 text-sm leading-relaxed ${
            isExpanded ? '' : 'line-clamp-3'
          }`}>
            {job.description}
          </p>
          
          {/* View Details Button */}
          <button
            onClick={onToggleExpanded}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isExpanded ? 'Show Less' : 'View Details'}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Card Body - Requirements (shown when expanded) */}
      {isExpanded && (
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Key Requirements
          </h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <Users className="w-4 h-4 mr-2 text-slate-400" />
              <span>Experience in relevant field</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 mr-2 text-slate-400" />
              <span>Strong communication skills</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 mr-2 text-slate-400" />
              <span>Team collaboration abilities</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 mr-2 text-slate-400" />
              <span>Problem-solving skills</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 mr-2 text-slate-400" />
              <span>Adaptability and learning mindset</span>
            </div>
          </div>
          
          {/* Additional Details */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h5 className="text-sm font-semibold text-slate-700 mb-2">What You'll Do</h5>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Work on challenging projects and innovative solutions</li>
              <li>• Collaborate with cross-functional teams</li>
              <li>• Contribute to the company's growth and success</li>
              <li>• Learn and develop new skills continuously</li>
            </ul>
          </div>
        </div>
      )}
      

      {/* Card Footer */}
      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="w-4 h-4 mr-2" />
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Apply Button */}
        <button
          onClick={() => onApply(job._id)}
          disabled={submitting}
          className="w-full bg-slate-800 text-white font-medium py-3 px-4 rounded-xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Applying...
            </>
          ) : (
            <>
              Apply Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateApplication;
