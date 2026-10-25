# TalentPulse ATS - Backend API Service

Express & MongoDB REST API service for TalentPulse Applicant Tracking System.

## Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose ODM
- **Security**: JWT (JSON Web Tokens), bcryptjs password hashing
- **File Uploads**: Multer (in-memory resume parsing)

## Setup & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and verify:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/talentpulse_ats
   JWT_SECRET=talentpulse_super_secret_jwt_key_2026_ats_platform
   CLIENT_URL=http://localhost:3000
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Seed Database Manually (Optional)**:
   ```bash
   npm run seed
   ```

## REST API Endpoints
- `GET /api/health` - Service health status
- `POST /api/auth/register` - Candidate / Recruiter registration
- `POST /api/auth/login` - User login with JWT token issuance
- `POST /api/auth/verify-otp` - Two-factor & password reset OTP verification
- `GET /api/jobs` - List all active job postings
- `POST /api/jobs` - Post a new job requisition
- `POST /api/ats/parse` - Parse uploaded resume and calculate ATS match score
- `POST /api/applications/apply` - Submit a job application
- `GET /api/applications/my` - Candidate's applied jobs
- `GET /api/applications/company` - Recruiter candidate pipeline
- `PUT /api/applications/:id/status` - Move candidate between hiring stages
- `GET /api/interviews` - Fetch scheduled interviews
- `POST /api/interviews/schedule` - Schedule an interview round
- `GET /api/analytics/stats` - Platform funnel & candidate metrics
