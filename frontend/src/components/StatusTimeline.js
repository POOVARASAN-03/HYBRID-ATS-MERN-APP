import { NotebookPen } from 'lucide-react';
import React from 'react';
import { Bot, User } from 'lucide-react';
const StatusTimeline = ({ history }) => {
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

  const getSourceIcon = (source) => {
    switch (source) {
      case 'bot-cron':
        return <Bot/>;
      case 'bot-manual':
        return <Bot/>;
      case 'manual':
        return <User />;
      default:
        return <NotebookPen/>;
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
      <div className="relative">
        {history.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSourceIcon(item.source)}</span>
                  <span className="font-medium text-gray-900">{item.updatedBy}</span>
                  <span className="text-sm text-gray-500">({item.source})</span>
                </div>
                <span className="text-sm text-gray-500 mt-2 sm:mt-0 whitespace-normal break-words max-w-full sm:max-w-xs text-right">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-600">Status changed:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                  {item.prevStatus}
                </span>
                <span className="text-gray-400">→</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.newStatus)} text-white`}>
                  {item.newStatus}
                </span>
              </div>
              
              {item.note && (
                <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTimeline;
