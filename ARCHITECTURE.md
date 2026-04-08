# 📝 Wish2Skill CampusOS: Technical Architecture

This document provides a deep dive into the engineering decisions and architecture of the Wish2Skill CampusOS platform.

## 🏗️ 1. High-Level Architecture
Wish2Skill CampusOS is built as a **Modern Full-Stack Next.js Application**, utilizing a serverless-ready architecture.

- **Frontend**: Next.js 15 with App Router. We leverage **Server Components** for data fetching (reducing client-side JS) and **Client Components** for interactivity.
- **Data Layer**: Prisma ORM acts as the bridge between our logic and the **PostgreSQL (Neon)** database.
- **Business Logic**: Implemented via **Server Actions**, providing a secure, direct-from-server execution model that eliminates the need for traditional REST/GraphQL boilerplate.

---

## 🗄️ 2. Database Schema
Our data model is designed for high relational integrity:
- **User & Profiles**: A central `User` model manages authentication, while polymorphic-like relations link to specific `Student` or `Faculty` profiles.
- **Academic Hierarchy**: `Course` ➔ `Batch` ➔ `Subject` ➔ `ClassSession`.
- **Integrity**: We use Prisma's cascading deletes and unique constraints (e.g., `@@unique([facultyId, subjectId, batchId])`) to prevent data corruption.

---

## 🔐 3. Authentication & RBAC
- **NextAuth v5**: Handles JWT-based sessions.
- **Role-Based Access Control (RBAC)**: 
    - Middlewares protect the dashboard routes (`/admin`, `/faculty`, `/student`).
    - Server-side role checks (`checkAdmin()`, etc.) within actions protect the database from unauthorized mutations.

---

## 🤖 4. AI Integration Strategy
We utilized **Google Gemini Pro** for three distinct use cases:
1. **Contextual Assistance**: System-prompted "Campus Scout" bot with role-specific logic.
2. **On-the-fly Transformation**: Material summarization for students.
3. **Sentiment Analysis**: Quantitative processing of qualitative user feedback.

---

## 📍 5. Geofencing Algorithm
To ensure physical attendance, we implemented the **Haversine Formula**:
- Calculates the great-circle distance between two points on a sphere.
- Validates student's browser `lat/lng` against the `CAMPUS_COORDS`.
- Accuracy enforced within a 500-meter radius.

---

## 📊 6. Engineering Principles
- **Aesthetic Excellence**: Every component is built with a "Premium-First" mindset, utilizing HSL color variables and Framer Motion for micro-animations.
- **Scalability**: Stateless server actions and serverless PostgreSQL (Neon) allow the platform to scale from 100 to 100,000 users without infrastructure overhauls.

---
