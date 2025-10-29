import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Briefcase, Clock, Users, CheckCircle, ArrowRight, ChevronDown, ChevronUp, Eye, Upload, FileText, X } from 'lucide-react';
import {toast} from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
const CreateApplication = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [error, setError] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    skills: [],
    resume: null
  });

  const navigate = useNavigate();
  const { user } = useAuth();

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

  const handleApply = (job) => {
    setSelectedJob(job);
    setApplicationData({
      skills: [],
      resume: null
    });
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;
    
    setSubmitting(true);
    setApplyingJobId(selectedJob._id);
    setError('');

    try {
      const formData = new FormData();
      formData.append('jobId', selectedJob._id);
      formData.append('skills', JSON.stringify(applicationData.skills));
      
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      const response = await axiosInstance.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Application submitted successfully', {
        duration: 3000,
        position: 'top-right',
      });

      // Only reveal resume match score to admin or bot, not to applicants
      if (response.data.data.matchScore > 0 && user && (user.role === 'admin' || user.role === 'bot')) {
        toast.info(`Resume match score: ${response.data.data.matchScore}%`, {
          duration: 5000,
          position: 'top-right',
        });
      }

      setShowApplicationModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create application');
      toast.error(error, {
        duration: 3000,
        position: 'top-right',
      });
      console.error('Error creating application:', err);
    } finally {
      setSubmitting(false);
      setApplyingJobId(null);
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
                      isApplying={applyingJobId === job._id}
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

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <ApplicationModal
          job={selectedJob}
          applicationData={applicationData}
          setApplicationData={setApplicationData}
          onSubmit={handleSubmitApplication}
          onClose={() => setShowApplicationModal(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
};

const JobCard = ({ job, onApply, isApplying, isExpanded, onToggleExpanded }) => {

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

      {/* Card Body Requirements (shown when expanded) */}
      {isExpanded && (
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Key Requirements
          </h4>
          {(() => {
            const requirements = Array.isArray(job.keyRequirements) && job.keyRequirements.length > 0
              ? job.keyRequirements
              : (Array.isArray(job.requiredKeywords) ? job.requiredKeywords : []);
            return requirements.length > 0 ? (
            <div className="space-y-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
            ) : (
              <p className="text-sm text-slate-500">No specific requirements provided.</p>
            );
          })()}

          {/* Required Skills */}
          {(() => {
            const skills = Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0
              ? job.requiredSkills
              : (Array.isArray(job.requiredKeywords) ? job.requiredKeywords : []);
            return skills.length > 0 ? (
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-2">Required Skills</h5>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            ) : null;
          })()}
          
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
          onClick={() => onApply(job)}
          disabled={isApplying}
          className={`w-full bg-slate-800 text-white font-medium py-3 px-4 rounded-xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center`}
        >
          {isApplying ? (
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

const ApplicationModal = ({ job, applicationData, setApplicationData, onSubmit, onClose, submitting }) => {
  const [newSkill, setNewSkill] = useState('');

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file only', {
          duration: 3000,
          position: 'top-right',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB', {
          duration: 3000,
          position: 'top-right',
        });
        return;
      }
      setApplicationData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !applicationData.skills.includes(newSkill.trim())) {
      setApplicationData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setApplicationData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Apply for {job.title}</h2>
              <p className="text-slate-600 mt-1">Complete your application details</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Job Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-800">{job.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.isTechnical 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {job.isTechnical ? 'Technical' : 'Non-Technical'}
              </span>
            </div>
            <p className="text-slate-600 text-sm">{job.description}</p>
            {(() => {
              const skills = Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0
                ? job.requiredSkills
                : (Array.isArray(job.requiredKeywords) ? job.requiredKeywords : []);
              return skills.length > 0 ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-slate-700 mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              ) : null;
            })()}
          </div>

          {/* Resume Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resume (PDF only, max 5MB)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors relative">
              {applicationData.resume ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-700">{applicationData.resume.name}</span>
                  <button
                    type="button"
                    onClick={() => setApplicationData(prev => ({ ...prev, resume: null }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">PDF files only, up to 5MB</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Skills
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Add
              </button>
            </div>
            {applicationData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {applicationData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateApplication;
