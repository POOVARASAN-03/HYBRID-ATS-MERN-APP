import mongoose from 'mongoose';
import User from '../models/User.js';
import JobPosting from '../models/JobPosting.js';
import Application from '../models/Application.js';
import dotenv from 'dotenv';
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'admin123', // Will be hashed by pre-save middleware
      role: 'admin'
    });

    const botUser = new User({
      name: 'Bot User',
      email: 'bot@example.com',
      passwordHash: 'bot123', // Will be hashed by pre-save middleware
      role: 'bot'
    });

    const applicant1 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'password123', // Will be hashed by pre-save middleware
      role: 'applicant'
    });

    const applicant2 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: 'password123', // Will be hashed by pre-save middleware
      role: 'applicant'
    });

    await adminUser.save();
    await botUser.save();
    await applicant1.save();
    await applicant2.save();
    console.log('Created users');

    // Create job postings
    const technicalJob = new JobPosting({
      title: 'Senior Software Engineer',
      description: 'We are looking for a senior software engineer with experience in React, Node.js, and MongoDB. The ideal candidate should have 5+ years of experience in full-stack development.',
      isTechnical: true,
      createdBy: adminUser._id
    });

    const nonTechnicalJob = new JobPosting({
      title: 'HR Executive',
      description: 'We are seeking an experienced HR Executive to manage our human resources operations. The role involves recruitment, employee relations, and policy development.',
      isTechnical: false,
      createdBy: adminUser._id
    });

    const frontendJob = new JobPosting({
      title: 'Frontend Developer',
      description: 'Join our team as a Frontend Developer specializing in React and modern JavaScript frameworks. Experience with TypeScript and testing frameworks preferred.',
      isTechnical: true,
      createdBy: adminUser._id
    });

    await technicalJob.save();
    await nonTechnicalJob.save();
    await frontendJob.save();
    console.log('Created job postings');

    // Create applications
    const application1 = new Application({
      jobId: technicalJob._id,
      jobTitle: technicalJob.title,
      applicantId: applicant1._id,
      roleType: 'technical',
      status: 'Applied',
      comments: [{
        text: 'Application submitted',
        by: applicant1.name,
        role: applicant1.role
      }],
      history: [{
        prevStatus: 'N/A',
        newStatus: 'Applied',
        updatedBy: applicant1.name,
        source: 'manual',
        note: 'Application submitted by applicant',
        timestamp: new Date()
      }]
    });

    const application2 = new Application({
      jobId: nonTechnicalJob._id,
      jobTitle: nonTechnicalJob.title,
      applicantId: applicant1._id,
      roleType: 'non-technical',
      status: 'Applied',
      comments: [{
        text: 'Application submitted',
        by: applicant1.name,
        role: applicant1.role
      }],
      history: [{
        prevStatus: 'N/A',
        newStatus: 'Applied',
        updatedBy: applicant1.name,
        source: 'manual',
        note: 'Application submitted by applicant',
        timestamp: new Date()
      }]
    });

    const application3 = new Application({
      jobId: frontendJob._id,
      jobTitle: frontendJob.title,
      applicantId: applicant2._id,
      roleType: 'technical',
      status: 'Applied',
      comments: [{
        text: 'Application submitted',
        by: applicant2.name,
        role: applicant2.role
      }],
      history: [{
        prevStatus: 'N/A',
        newStatus: 'Applied',
        updatedBy: applicant2.name,
        source: 'manual',
        note: 'Application submitted by applicant',
        timestamp: new Date()
      }]
    });

    await application1.save();
    await application2.save();
    await application3.save();
    console.log('Created applications');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n🔐 System Accounts (Created by Admin):');
    console.log('Admin: admin@example.com / admin123');
    console.log('Bot: bot@example.com / bot123');
    console.log('\n👥 Sample Applicant Accounts:');
    console.log('Applicant 1: john@example.com / password123');
    console.log('Applicant 2: jane@example.com / password123');
    console.log('\n📝 Note: New applicants can register through the frontend, but Admin and Bot accounts must be created by system administrators.');
    console.log('\nJob postings:');
    console.log('- Senior Software Engineer (Technical)');
    console.log('- HR Executive (Non-Technical)');
    console.log('- Frontend Developer (Technical)');
    console.log('\nApplications:');
    console.log('- John applied to Senior Software Engineer');
    console.log('- John applied to HR Executive');
    console.log('- Jane applied to Frontend Developer');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
