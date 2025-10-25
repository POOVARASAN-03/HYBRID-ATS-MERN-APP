import Application from '../models/Application.js';
import JobPosting from '../models/JobPosting.js';

// Run bot automation (deterministic rules for technical applications)
const runBot = async (req, res) => {
  try {
    console.log('🤖 Bot automation started...');
    
    // Get all technical applications that are not in final states
    const applications = await Application.find({
      roleType: 'technical',
      status: { $nin: ['Offer', 'Rejected'] }
    }).populate('jobId');

    const now = new Date();
    const changed = [];

    for (const app of applications) {
      // Double-check that the job is technical
      if (!app.jobId.isTechnical) {
        console.log(`⚠️ Skipping application ${app._id} - job is not technical`);
        continue;
      }

      const prevStatus = app.status;
      let newStatus = prevStatus;
      let note = '';

      // Deterministic progression rules
      switch (prevStatus) {
        case 'Applied':
          newStatus = 'Reviewed';
          note = 'Bot: Application reviewed and moved to next stage';
          break;
        
        case 'Reviewed':
          newStatus = 'Interview';
          note = 'Bot: Application approved for interview';
          break;
        
        case 'Interview':
          // Deterministic decision based on application ID for consistency
          const decisionSeed = app._id.toString().charCodeAt(app._id.toString().length - 1);
          const shouldOffer = decisionSeed % 3 !== 0; // 66% chance of offer
          newStatus = shouldOffer ? 'Offer' : 'Rejected';
          note = shouldOffer 
            ? 'Bot: Interview successful, extending offer'
            : 'Bot: Interview did not meet requirements';
          break;
        
        default:
          console.log(`⚠️ Skipping application ${app._id} - status ${prevStatus} not handled`);
          continue;
      }

      if (newStatus !== prevStatus) {
        // Update status
        app.status = newStatus;

        // Add to history
        app.history.push({
          prevStatus,
          newStatus,
          updatedBy: 'Bot',
          source: req.header('X-Bot-Token') ? 'bot-cron' : 'bot-manual',
          note,
          timestamp: now
        });

        // Add comment
        app.comments.push({
          text: note,
          by: 'Bot',
          role: 'bot',
          date: now
        });

        await app.save();
        changed.push({
          id: app._id,
          jobTitle: app.jobTitle,
          applicantName: app.applicantId.name || 'Unknown',
          prevStatus,
          newStatus
        });

        console.log(`✅ Updated application ${app._id}: ${prevStatus} → ${newStatus}`);
      }
    }

    console.log(`🤖 Bot automation completed. Updated ${changed.length} applications.`);

    res.json({
      success: true,
      message: 'Bot automation completed successfully',
      data: {
        updatedCount: changed.length,
        applications: changed,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Bot automation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bot automation'
    });
  }
};

// Get bot dashboard data
const getBotDashboard = async (req, res) => {
  try {
    // Get technical applications
    const technicalApplications = await Application.find({
      roleType: 'technical'
    })
      .populate('jobId', 'title isTechnical')
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    // Get bot activity (recent history entries by bot)
    const botActivity = await Application.aggregate([
      {
        $unwind: '$history'
      },
      {
        $match: {
          'history.updatedBy': 'Bot'
        }
      },
      {
        $sort: { 'history.timestamp': -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          jobTitle: 1,
          status: 1,
          prevStatus: '$history.prevStatus',
          newStatus: '$history.newStatus',
          source: '$history.source',
          timestamp: '$history.timestamp',
          note: '$history.note'
        }
      }
    ]);

    console.log('Bot activity data:', JSON.stringify(botActivity, null, 2));

    // Get application counts by status for technical applications
    const statusCounts = await Application.aggregate([
      {
        $match: { roleType: 'technical' }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        technicalApplications,
        botActivity,
        statusCounts
      }
    });
  } catch (error) {
    console.error('Get bot dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bot dashboard data'
    });
  }
};

// Get bot statistics
const getBotStats = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Applications processed by bot in last 24 hours
    const recentBotActivity = await Application.aggregate([
      {
        $unwind: '$history'
      },
      {
        $match: {
          'history.updatedBy': 'Bot',
          'history.timestamp': { $gte: last24Hours }
        }
      },
      {
        $group: {
          _id: '$history.source',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total applications by status
    const totalByStatus = await Application.aggregate([
      {
        $match: { roleType: 'technical' }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Applications ready for bot processing
    const readyForProcessing = await Application.countDocuments({
      roleType: 'technical',
      status: { $nin: ['Offer', 'Rejected'] }
    });

    res.json({
      success: true,
      data: {
        recentBotActivity,
        totalByStatus,
        readyForProcessing,
        lastRun: now
      }
    });
  } catch (error) {
    console.error('Get bot stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bot statistics'
    });
  }
};

export {
  runBot,
  getBotDashboard,
  getBotStats
};
