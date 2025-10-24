# Interview Application Tracker

A comprehensive interview application tracking system with role-based authentication, automated bot processing, and full traceability.

## 🚀 Features

- **Role-based Authentication**: Applicant, Admin, and Bot roles with JWT tokens
- **Job Management**: Create and manage technical/non-technical job postings
- **Application Tracking**: Full application lifecycle with status updates
- **Bot Automation**: Automated processing for technical applications with cron scheduling
- **Admin Dashboard**: Manual management for non-technical applications
- **Timeline View**: Complete history and traceability for all applications
- **Responsive UI**: Modern, mobile-friendly interface with Tailwind CSS

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

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd interview-tracker
```

2. Start the application:
```bash
docker-compose up -d
```

3. Seed the database:
```bash
docker exec -it interview-tracker-backend npm run seed
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option 2: Manual Setup

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

## 🔐 Demo Accounts

The seed script creates the following demo accounts:

- **Admin**: admin@example.com / admin123
- **Bot**: bot@example.com / bot123
- **Applicant**: john@example.com / password123
- **Applicant**: jane@example.com / password123

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

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Jobs
- `POST /api/jobs` - Create job (Admin only)
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (Admin only)
- `DELETE /api/jobs/:id` - Delete job (Admin only)

### Applications
- `POST /api/applications` - Create application (Applicant)
- `GET /api/applications` - List applications (role-based)
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update status (Admin/Bot)
- `POST /api/applications/:id/comments` - Add comment

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/applications/non-technical` - Non-technical applications
- `PUT /api/admin/applications/:id` - Update non-technical application

### Bot
- `POST /api/bot/run` - Run bot automation
- `GET /api/bot/dashboard` - Bot dashboard data
- `GET /api/bot/stats` - Bot statistics

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.com/api`

### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `INTERNAL_BOT_TOKEN`
   - `PORT`

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing the Application

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

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/interview-tracker
JWT_SECRET=your_jwt_secret_key_here
INTERNAL_BOT_TOKEN=bot_secret_token_here
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ for interview management and automation**
