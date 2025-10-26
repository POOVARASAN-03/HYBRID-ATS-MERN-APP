# Hybrid ATS (Applicant Tracking System)

A comprehensive interview application tracking system with role-based authentication, automated bot processing, and full traceability.

## 🌐 Live Demo

- **Frontend**: [https://hybrid-ats-mern-app.onrender.com](https://hybrid-ats-mern-app.onrender.com)
- **Backend API**: [https://hybridatsapi.onrender.com](https://hybridatsapi.onrender.com)
- **API Documentation**: See `API_DOCUMENTATION.md` for complete API reference
- **Postman Collection**: Import `Hybrid_ATS_API.postman_collection.json` for testing

## 🚀 Features

- **Role-based Authentication**: Applicant, Admin, and Bot roles with JWT tokens
- **Job Management**: Create and manage technical/non-technical job postings
- **Application Tracking**: Full application lifecycle with status updates
- **Bot Automation**: Automated processing for technical applications with cron scheduling
- **Admin Dashboard**: Manual management for non-technical applications
- **Timeline View**: Complete history and traceability for all applications
- **Responsive UI**: Modern, mobile-friendly interface with Tailwind CSS
- **RESTful API**: Complete API with comprehensive documentation

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- RESTful API with JWT authentication
- Mongoose ODM for MongoDB
- Role-based middleware and authorization
- Automated bot processing with node-cron
- Input validation and error handling

### Frontend (React + Tailwind CSS)
- Single Page Application with React Router
- Context-based state management
- Responsive design with Tailwind CSS
- Role-specific dashboards and components

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn

## 🛠️ Installation & Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd interview-tracker
```

2. Access the application after starting both services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/interview-tracker
JWT_SECRET=your_jwt_secret_key_here
INTERNAL_BOT_TOKEN=bot_secret_token_here
PORT=5000
NODE_ENV=development
```

5. Start MongoDB service

6. Seed the database:
```bash
npm run seed
```

7. Start the backend:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend:
```bash
npm start
```


## 📊 User Roles & Permissions

### Applicant
- View own applications
- Create new applications
- Add comments to applications
- View application timeline

### Admin
- View all applications
- Manage non-technical applications
- Update application status
- Add comments to any application
- View dashboard statistics
- Manage job postings

### Bot
- View technical applications
- Run automated processing
- View bot activity and statistics
- Automated status progression

## 🤖 Bot Automation

The bot automatically processes technical applications with deterministic rules:

1. **Applied** → **Reviewed** (automatic)
2. **Reviewed** → **Interview** (automatic)
3. **Interview** → **Offer** or **Rejected** (deterministic decision)

### Bot Features
- Runs every 30 minutes via cron
- Manual trigger via "Run Bot Now" button
- Only processes technical applications
- Maintains complete audit trail
- Deterministic decision making

## 🛡️ Security Features

- JWT-based authentication
- Role-based authorization
- Input validation and sanitization
- CORS protection
- Secure password hashing with bcrypt
- Internal bot token for cron security

## 📱 API Documentation

### Quick Reference
- **Base URL**: `https://hybridatsapi.onrender.com`
- **Health Check**: `GET /health`
- **Authentication**: JWT Bearer tokens required for protected routes

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration (applicant only)
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Jobs
- `POST /api/jobs` - Create job (Admin only)
- `GET /api/jobs` - List jobs (with filtering)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (Admin only)
- `DELETE /api/jobs/:id` - Delete job (Admin only)

#### Applications
- `POST /api/applications` - Create application (Applicant)
- `GET /api/applications` - List applications (role-based filtering)
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update status (Admin/Bot)
- `POST /api/applications/:id/comments` - Add comment

#### Admin Management
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/applications/non-technical` - Non-technical applications
- `GET /api/admin/applications/technical` - Technical applications (read-only)
- `PUT /api/admin/applications/:id` - Update non-technical application
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role

#### Bot Automation
- `POST /api/bot/run` - Run bot automation
- `GET /api/bot/dashboard` - Bot dashboard data
- `GET /api/bot/stats` - Bot statistics


### 🧪 Postman Collection
Import the provided Postman collection (`Hybrid_ATS_API.postman_collection.json`) to test all API endpoints with pre-configured requests and test scenarios.

## 🚀 Deployment

### Current Deployment
- **Frontend**: Deployed on Render at [https://hybrid-ats-mern-app.onrender.com](https://hybrid-ats-mern-app.onrender.com)
- **Backend**: Deployed on Render at [https://hybridatsapi.onrender.com](https://hybridatsapi.onrender.com)
- **Database**: MongoDB Atlas


## 🧪 Testing the Application

### Live Demo Testing
1. **Visit the Live Application**: [https://hybrid-ats-mern-app.onrender.com](https://hybrid-ats-mern-app.onrender.com)

### API Testing
1. **Import Postman Collection**: Use `Hybrid_ATS_API.postman_collection.json`
2. **Set Base URL**: `https://hybridatsapi.onrender.com`
3. **Run Test Scenarios**: Complete application flow tests included

### Local Testing
1. **Login as Applicant**:
   - Create applications for different jobs
   - View application timeline
   - Add comments

2. **Login as Admin**:
   - View dashboard statistics
   - Manage non-technical applications
   - Update application status

3. **Login as Bot**:
   - View technical applications
   - Run bot automation manually
   - Monitor bot activity

4. **Test Bot Automation**:
   - Create technical applications
   - Wait for cron or trigger manually
   - Observe status progression


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

