# TalentPulse ATS - Frontend Architecture (Review 1)

TalentPulse is an AI-powered enterprise **Applicant Tracking System (ATS)** and **Resume Intelligence Platform** built for high-scale talent acquisition and seamless applicant career journeys.

---

## 🌟 Review 1 Core Modules & Features

1. **Enterprise Landing Page & Showcase**
   - High-contrast responsive design with dark/light mode toggle.
   - Live Placement & Impact benchmark metrics.
   - Purpose-built Institutional Ecosystem tabs (Candidate Career Center & Enterprise Talent Acquisition).
   - Latest Recruitment Drives feed, ATS Career Insights, and Fortune 500 hiring partners marquee.

2. **Candidate Career Center**
   - **Job Discovery & Search**: Live search by position, required skills, and location filter.
   - **1-Click Application**: Attach resume text/file, automated parsing, and instant submission.
   - **My Applications Tracker**: Live status pipeline (`APPLIED` → `UNDER_REVIEW` → `INTERVIEWING` → `OFFERED` → `REJECTED`).
   - **Interviews Scheduler View**: View upcoming rounds, meeting links, dates, and interviewers.
   - **Real-Time ATS Score Checker**: Match resume text against any open job, review category scores (Keywords, Skills, Experience, Education, Formatting), and read actionable suggestions.
   - **Interactive Resume Builder**: Drag-and-drop / reorder sections, edit personal details, education, experience, skills, projects, certifications, and download ATS-compliant text/PDF format.

3. **Enterprise Recruiter Suite**
   - **Recruitment Dashboard**: Real-time KPI counters (Active Jobs, Total Applications, Shortlisted Talent, Interviews, Hires).
   - **Candidate Review & Shortlisting**: Filter by job requisition, view extracted education/skills, inspect ATS match percentages, and update candidate lifecycle status.
   - **Job Requisition Publishing**: Post new positions with location, employment type, required experience, skill tags, and salary range. Newly posted jobs immediately reflect across the platform.
   - **Interview Scheduler**: Set interview dates, times, round formats (Technical Screening, System Design, Culture Fit), meeting URLs, and interviewer notes.

4. **Institutional Admin & System Audit**
   - User administration and role-based access control (`ROLE_CANDIDATE`, `ROLE_COMPANY`, `ROLE_ADMIN`).
   - Platform-wide talent analytics and funnel metrics.
   - System audit logs and client engine monitoring.

5. **Universal Security & Authentication Modal**
   - Role-specific login & registration (Candidate vs. Recruiter).
   - Alphanumeric dynamic CAPTCHA security generator.
   - OTP two-factor verification simulation (Code: `123456`).
   - Password reset workflow with email verification.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation & Launch

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *(Or from the repository root: `npm run dev`)*

3. **Open the App in your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🔑 Pre-Seeded Demo Credentials

For quick evaluation during Review 1, click the **Demo: Candidate** or **Demo: Recruiter** pills in the top navigation bar, or log in with these credentials:

| Role | Username / Email | Password | Pre-seeded Features |
| :--- | :--- | :--- | :--- |
| **Candidate** | `john.doe@example.com` | `john123` | Active applications, 88% average ATS score, scheduled Google interview, saved jobs. |
| **Recruiter** | `careers@google.com` | `google123` | Google hiring portal, candidate review pipeline, status updates, interview scheduler. |
| **Admin** | `admin@talentpulse.io` | `admin123` | Platform analytics, system audit logs, user management. |
| **Demo OTP** | *(Any registered email)* | `123456` | Works for all two-factor and password reset verifications. |

---

## 📱 Responsive Design Standards

- **Mobile Viewports (360px - 480px)**: Compact TopBar, responsive hamburger drawer with dark/light mode toggle and demo quick-switchers, mobile horizontal tab navigation for candidate and recruiter portals.
- **Tablet Viewports (768px - 1024px)**: Adaptive grid cards, responsive data tables with touch-friendly horizontal scroll containers.
- **Desktop Viewports (1280px+)**: Glassmorphism panels, 3D tilt interactions, and enterprise dashboard multi-column layout.
