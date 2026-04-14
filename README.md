# 🎓 Wish2Skill CampusOS

**A Secure, Role-Based, AI-Powered Institute Management Platform**  
*Built with Next.js 15, TypeScript, Prisma, and Gemini AI.*

---

## 🚀 Overview

**Wish2Skill CampusOS** is a comprehensive, production-ready ERP and LMS solution designed for modern educational institutions. It streamlines academic operations, automates administrative tasks, and enhances the learning experience through cutting-edge AI integrations and a premium, responsive user interface.

### 🌟 Key Value Propositions
- **For Admins**: Total control over the institute's pulse—from global announcements to executive analytics.
- **For Faculty**: Effortless management of class schedules, bulk attendance, and automated assessments.
- **For Students**: A unified digital campus for attendance, study resources, AI-powered insights, and grade tracking.

---

## ✨ Features

### 🏛️ 1. Core Administration
- **Academic Mapping**: Complete management of Courses, Batches, and Subjects.
- **User Orchestration**: Streamlined onboarding for Students, Faculty, and Staff with secure role-based access control (RBAC).
- **Faculty Workload Mapping**: Explicit assignment of instructors to batches and subjects.

### 🤖 2. The AI Suite (Powered by Google Gemini)
- **Campus Scout**: A global, role-aware AI assistant to help users navigate and solve queries.
- **Smart Summarization**: On-demand AI breakdown of complex learning materials into actionable insights.
- **Sentiment Feedback**: AI-driven analysis of student/faculty feedback to identify campus satisfaction and critical issues.

### 📅 3. Academic Operations
- **Interactive Scheduling**: Responsive timetable management with room and meet-link integration.
- **Geo-Fenced Attendance**: Secure, location-verified self-attendance for students using browser geolocation and Haversine distance validation.
- **Automated Assessments**: Dynamic MCQ test creator with instant auto-grading and results persistence.

### 🏥 4. Campus Lifestyle
- **Leave Management**: Digital application and approval workflow for student absences.
- **Global Announcements**: Real-time broadcasts with automated email notifications.
- **Resource Center**: Centralized hub for study materials, handbooks, and documents.
- **Executive Analytics**: Stunning data visualizations for Authority users using Recharts.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React |
| **Backend** | Next.js Server Actions, Node.js |
| **Database** | PostgreSQL (Neon.tech), Prisma ORM |
| **Authentication** | NextAuth.js v5 (Auth.js) |
| **AI Layer** | Google Gemini API (Generative AI) |
| **Messaging** | Resend API (Email Notifications) |
| **UI Components** | Radix UI, Shadcn/UI, Framer Motion |
| **Analytics** | Recharts |

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/nishar269/Wish2SkillsProject.git
cd wish2skill-campusos
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
DATABASE_URL="your_neon_postgresql_url"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"

GEMINI_API_KEY="your_google_gemini_api_key"
RESEND_API_KEY="your_resend_api_key"
```

### 3. Initialize Database
```bash
npm install
npx prisma db push
npx prisma generate
```

### 4. Seed Initial Data
Run the development server and visit `http://localhost:3000/api/seed` to populate the platform with administrative roles and demo records.

---

## 🔐 Credentials (Demo Mode)

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | admin@wish2skill.com | Password123 |
| **Faculty** | faculty@wish2skill.com | Password123 |
| **Student** | student@wish2skill.com | Password123 |

---

## 🏗️ Architecture

The project follows a **Shared Monolith** architecture with a clean separation of concerns:
- **Client Components**: Interactive, high-performance UI using React 19 features.
- **Server Actions**: Secure, type-safe API layer for database mutations and business logic.
- **Prisma Middlewares**: Ensure complex relations and cascading deletes are handled efficiently.
- **RBAC Middleware**: Protects routes based on JWT-session roles (Admin, Coordinator, Faculty, Student).

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed for Wish2Skill by nishar.**
