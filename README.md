# OJTerm — Smart Web-Based OJT Matching Platform & Recommendation System

> **Course & Subject:** ITPD4 Software Engineering Prefinal (Test II)  
> **Development Team:** Team DUTERTECH  
> **Section:** Section 1  

---

## 1. Project Overview & Problem Summary

### The Problem
On-the-job training (OJT) placement in the academic institution has historically suffered from fragmented, unorganized, and referral-dependent practices:
1. **Students** discover internship openings via informal social media threads and peer referrals without knowing if their academic qualifications align with employer expectations.
2. **OJT Coordinators** are overburdened with manually inspecting paper endorsement letters, tracking submissions across spreadsheets, and compiling compliance reports by hand.
3. **Industry Partners (Host Training Establishments)** receive unvetted, disorganized submissions and lack a centralized platform to communicate placement decisions directly with institutional coordinators.

### The Solution: OJTerm
**OJTerm** is a centralized, role-gated web platform and deterministic recommendation engine that bridges students, industry partners, faculty coordinators, and school administrators:
- **OJT Students** build structured profiles (degree program, year level, technical skills, preferred location, career interests), receive deterministic, ranked rule-based internship recommendations (<3s latency), submit applications with mandatory college endorsement letters, and track statuses in real time.
- **Industry Partners** register their corporate entity, publish verified internship slots, and screen **only** coordinator-approved candidates.
- **OJT Coordinators** review pending candidate packages, inspect embedded endorsement documents, approve/reject/return submissions, verify host companies, and generate monthly institutional placement reports with CSV export.
- **School Administrators** manage platform user credentials, track audit trails, and oversee institutional metrics.

---

## 2. Team DUTERTECH Member Roster

| Member Name | Project Role | Responsibilities |
|-------------|--------------|------------------|
| **Lead Full-Stack Engineer** | Project Lead / Backend Architect | Database Architecture, Sequelize ORM Models, REST API Routes, Middleware, Rule-Based Engine |
| **Frontend Engineer** | UI/UX & Client Lead | React (Vite) Components, CSS Design System, AuthContext, Responsive Layouts, Modal/Preview UI |
| **QA & Systems Analyst** | Quality Assurance / System Analyst | Test Scenarios (1-7), Volume Benchmark (NFR-03), Audit Logging, Documentation & ERD Traceability |
| **Database Administrator** | DBA & DevOps | MySQL Schema & Migrations, Junction Tables, Seeders, Backup DDL Reference |

---

## 3. Technology Stack

- **Frontend:** React 18 (Vite), React Router v6, Axios, Native Vanilla CSS Design System (Zero Tailwind as per specification).
- **Backend:** Node.js, Express.js (v4), JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing (10 salt rounds).
- **Database & ORM:** MySQL 8+/9+ relational database, Sequelize ORM (11 entities + 2 junction tables, foreign keys, ENUM types, composite primary keys, indices).
- **Document Storage:** Structured local disk storage (`uploads/applications/{id}/`) with secure, authenticated streaming.
- **Email Notifications:** Nodemailer with Ethereal SMTP / console fallback.
- **Logging & Auditing:** Comprehensive `AUDIT_LOG` entity tracking user actions, entity IDs, and JSON state diffs (`OldValue` vs `NewValue`).

---

## 4. Functional Requirements Mapping (FR-01 to FR-12)

| Requirement ID | Module | Feature Description | Primary Endpoint & Handler |
|---|---|---|---|
| **FR-01** | Profile (MOD-01) | Student profile creation with program, year, location, and interactive skill chips | `POST /api/students/profile`<br>`GET /api/students/profile` |
| **FR-02** | Profile (MOD-01) | Company profile registration with default `Pending` verification status | `POST /api/companies/profile`<br>`GET /api/companies/profile` |
| **FR-03** | Profile (MOD-01) | Post internship opportunity (requires `Verified` company status, future deadline, slots > 0) | `POST /api/postings`<br>`GET /api/postings` |
| **FR-04** | Matching (MOD-02) | Deterministic rule-based matching engine (+40 program, +30 skills, +20 location, +10 interests) with <3s hard timeout | `GET /api/recommendations/:profileId` |
| **FR-05** | Application (MOD-03) | Application submission with mandatory endorsement document upload (PDF/JPG/PNG <= 10MB) | `POST /api/applications` |
| **FR-06** | Application (MOD-03) | File validation, disk persistence, and student submission tracking | `GET /api/applications/my`<br>`GET /api/applications/:id/document` |
| **FR-07** | Application (MOD-03) | Coordinator application queue with status filtering & full candidate detail view | `GET /api/coordinator/applications`<br>`GET /api/coordinator/applications/:id` |
| **FR-08** | Application (MOD-03) | Coordinator decision (Approve, Reject, Return for Correction) with BR-01 doc check & audit logging | `PATCH /api/coordinator/applications/:id` |
| **FR-09** | Application (MOD-03) | Partner candidate screening restricted strictly to coordinator-approved applicants (BR-03) with Accept/Reject actions | `GET /api/partner/postings/:id/applicants`<br>`PATCH /api/partner/applications/:id` |
| **FR-10** | Notification (MOD-04) | In-app notification creation & unread count badge for status lifecycle updates | `GET /api/notifications`<br>`GET /api/notifications/unread-count` |
| **FR-11** | Notification (MOD-04) | Email notification dispatch via Nodemailer (Ethereal test preview / console fallback) | Internal dispatcher `notifyUser` |
| **FR-12** | Reporting (MOD-05) | Monthly institutional placement report aggregated by Company & Program with CSV export | `GET /api/reports/placements?month=&year=&format=csv` |

---

## 5. Business Rules & Non-Functional Requirements

### Business Rules (Enforced in Code & Database)
- **BR-01:** An application cannot be Approved if the endorsement document is missing. Enforced in `PATCH /api/coordinator/applications/:id` and disabled on the coordinator review interface.
- **BR-02:** Only a user with role `OJTCoordinator` may approve or reject an application. Enforced by `requireRole('OJTCoordinator')` middleware with 403 audit logging.
- **BR-03:** Industry partners can only view coordinator-approved applicants (`Status IN ('Approved', 'Placed', 'RejectedByPartner')`). Raw submissions are shielded.

### Non-Functional Requirements
- **NFR-01:** JWT authentication required on all endpoints except `/api/auth/login`, `/api/auth/signup`, and `/api/health`.
- **NFR-02:** Role-based access control (`requireRole`) returning HTTP 403 on role mismatch.
- **NFR-03:** Recommendations return within 3,000 ms. Verified with 1,000 artificial postings and 100 skills benchmark (executed at 54 ms).
- **NFR-04:** Inline field validation messages on all client forms and consistent server error response schema.
- **NFR-05:** Application records and endorsement documents persist to database and disk; survives browser refresh.
- **NFR-06:** Tested and compliant with current Google Chrome and Microsoft Edge browsers.

---

## 6. Project Directory Structure

```
ojterm/
├── client/                                 # React Frontend (Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/                            # Axios API wrappers
│       │   ├── admin.api.js
│       │   ├── auth.api.js
│       │   ├── axios.js
│       │   ├── coordinator.api.js
│       │   ├── notification.api.js
│       │   ├── partner.api.js
│       │   ├── report.api.js
│       │   └── student.api.js
│       ├── components/                     # Shared UI Components
│       │   ├── Badge.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── Modal.jsx
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/                        # React Context Providers
│       │   ├── AuthContext.jsx
│       │   └── ToastContext.jsx
│       ├── pages/                          # Role-Gated Application Pages
│       │   ├── admin/                      # ManageUsers, Reports, AuditLogs
│       │   ├── auth/                       # Login, Signup
│       │   ├── coordinator/                # Dashboard, ApplicationsQueue, ApplicationReview, PlacementReport, CompanyVerification
│       │   ├── partner/                    # CompanyProfile, PostingList, ScreenApplicants
│       │   └── student/                    # ProfileBuilder, Recommendations, InternshipDetail, Apply, MyApplications
│       ├── styles/                         # Native CSS Design System (index.css)
│       ├── App.jsx
│       └── main.jsx
├── server/                                 # Node.js + Express Backend
│   ├── .env.example                        # Environment template
│   ├── .sequelizerc                        # Sequelize CLI configuration
│   ├── package.json
│   ├── uploads/                            # Endorsement document storage
│   │   ├── applications/
│   │   └── sample_endorsement.pdf          # Demo placeholder document
│   └── src/
│       ├── config/                         # Database and environment configs
│       │   ├── db.js
│       │   ├── env.js
│       │   └── sequelize-config.js
│       ├── middleware/                     # Express Middlewares
│       │   ├── auth.js                     # JWT verification
│       │   ├── error.js                    # Centralized error handler
│       │   ├── role.js                     # RBAC authorization & 403 audit
│       │   └── upload.js                   # Multer 10MB document upload
│       ├── migrations/                     # 12 Sequelize migration files
│       ├── models/                         # 11 Sequelize entities + 2 junction models
│       ├── modules/                        # Business logic modules
│       │   ├── application/                # MOD-03 Application service & controller
│       │   ├── auth/                       # Authentication controller
│       │   ├── coordinator/                # Coordinator verification & KPI controller
│       │   ├── matching/                   # MOD-02 Deterministic matching engine
│       │   ├── notification/               # MOD-04 In-app & Nodemailer service
│       │   ├── posting/                    # Internship postings service
│       │   ├── profile/                    # MOD-01 Student & Company profile service
│       │   └── reporting/                  # MOD-05 Placement reports & CSV export
│       ├── routes/                         # Centralized API routing
│       ├── scripts/                        # Database migration & volume test runners
│       ├── seeders/                        # Database seeder scripts
│       ├── utils/                          # Audit logger, mailer, response helpers
│       ├── app.js                          # Express app configuration
│       └── server.js                       # Server entry point
├── database/
│   └── schema.sql                          # Raw MySQL DDL schema reference
├── package.json                            # Root runner scripts
└── README.md                               # Project documentation
```

---

## 7. Database Entity-Relationship Diagram (ASCII)

```
+--------------------+            +------------------------+
|        USER        | 1        1 |    STUDENT_PROFILE     |
|--------------------|------------|------------------------|
| UserID (PK)        |            | ProfileID (PK)         |
| Name               |            | UserID (FK, UNIQUE)    |
| Email (UNIQUE)     |            | AcademicProgram        |
| PasswordHash       |            | YearLevel              |
| Role (ENUM)        |            | PreferredLocation      |
| Status (ENUM)      |            | Interests              |
+--------------------+            +------------------------+
       | 1                                    | 1
       |                                      | M
       | 1                        +------------------------+
       |                          |     STUDENT_SKILL      |
+--------------------+            |------------------------|
|  COMPANY_PROFILE   |            | ProfileID (PK, FK)     |
|--------------------|            | SkillID (PK, FK)       |
| CompanyID (PK)     |            +------------------------+
| UserID (FK, UNIQUE)|                        | M
| CompanyName        |                        | 1
| Industry           |            +------------------------+
| OfficeAddress      |            |         SKILL          |
| ContactPerson      |            |------------------------|
| ContactEmail       |            | SkillID (PK)           |
| VerificationStatus |            | SkillName (UNIQUE)     |
+--------------------+            +------------------------+
       | 1                                    | 1
       | M                                    | M
+--------------------+            +------------------------+
| INTERNSHIP_POSTING | 1        M |POSTING_SKILL_REQUIREMT |
|--------------------|------------|------------------------|
| PostingID (PK)     |            | PostingID (PK, FK)     |
| CompanyID (FK)     |            | SkillID (PK, FK)       |
| Title              |            +------------------------+
| Slots              |
| RequiredProgram    |
| Location           |
| ApplicationDeadline|
| Status (ENUM)      |
+--------------------+
       | 1
       | M
+----------------------------------------------------------+
|                       APPLICATION                        |
|----------------------------------------------------------|
| ApplicationID (PK)                                       |
| ProfileID (FK -> STUDENT_PROFILE)                        |
| PostingID (FK -> INTERNSHIP_POSTING)                     |
| Status (ENUM: Pending, Approved, Rejected, Returned...)  |
| DateSubmitted / DateReviewed                             |
| ReviewedByCoordinatorID (FK -> USER, NULL)              |
| PartnerDecision (ENUM: None, Accepted, Rejected)         |
| FeedbackComment                                          |
+----------------------------------------------------------+
       | 1
       | 1
+----------------------------------------------------------+
|                   ENDORSEMENT_DOCUMENT                   |
|----------------------------------------------------------|
| DocumentID (PK)                                          |
| ApplicationID (FK -> APPLICATION, UNIQUE)                |
| FileName, FilePath, FileSize, UploadDate                 |
+----------------------------------------------------------+

+--------------------+     +--------------------+     +--------------------+
|    NOTIFICATION    |     |  PLACEMENT_REPORT  |     |     AUDIT_LOG      |
|--------------------|     |--------------------|     |--------------------|
| NotificationID(PK) |     | ReportID (PK)      |     | AuditID (PK)       |
| UserID (FK)        |     | CoordinatorID (FK) |     | UserID (FK, NULL)  |
| Message, Type      |     | Month, Year        |     | Action             |
| IsRead, DateSent   |     | ReportData (JSON)  |     | EntityAffected/ID  |
| RelatedAppID (FK)  |     | GeneratedDate      |     | OldValue/NewValue  |
+--------------------+     +--------------------+     +--------------------+
```

---

## 8. Installation & Setup Instructions

### Prerequisites
- Node.js (v18+ or v20+/v24+)
- MySQL Server (e.g., via WAMP, XAMPP, or standalone MySQL on port 3306)

### Step-by-Step Setup
```bash
# 1. Clone the repository
git clone <repository-url>
cd OJTernSystem

# 2. Configure Environment Variables
cd server
cp .env.example .env
# Edit .env with your MySQL credentials if different from defaults:
# DB_HOST=127.0.0.1, DB_PORT=3306, DB_USER=root, DB_PASSWORD=, DB_NAME=ojterm

# 3. Install Dependencies
cd ../server && npm install
cd ../client && npm install

# 4. Run Database Migrations and Seeders
cd ../server
npm run migrate
npm run seed

# 5. Start Backend and Frontend Servers
# Terminal 1 (Backend - Port 5000):
npm run dev

# Terminal 2 (Frontend - Port 3000):
cd ../client
npm run dev
```

---

## 9. Demo Credentials

> **Default Password for ALL Seed Accounts:** `Password123!`

| Role | Email Address | Description | Primary Landing Page |
|---|---|---|---|
| **Student (BSIT)** | `student1@ojterm.test` | Year 3 BSIT, React/Node.js skills, 3 notifications | `/student/recommendations` |
| **Student (BSCS)** | `student2@ojterm.test` | Year 4 BSCS, Python/SQL/Data skills | `/student/recommendations` |
| **Industry Partner** | `partner1@ojterm.test` | Company A Tech Innovations (**Verified**) | `/partner/postings` |
| **Industry Partner** | `partner2@ojterm.test` | Company B Data Solutions (**Pending**) | `/partner/company` |
| **OJT Coordinator** | `coordinator@ojterm.test` | Faculty Reviewer (Prof. Allan Reyes) | `/coordinator/dashboard` |
| **School Administrator** | `admin@ojterm.test` | Platform Administrator | `/admin/users` |

> *Tip: The Login page features 1-click Quick Login buttons for every demo account.*

---

## 10. Postman Testing & Verification

1. Import collection or set `{{baseUrl}}` to `http://localhost:5000/api`.
2. **Login:** Send `POST {{baseUrl}}/auth/login` with `{"email": "student1@ojterm.test", "password": "Password123!"}`. Save the returned `token`.
3. Set header `Authorization: Bearer {{token}}` for subsequent requests.
4. **Get Recommendations:** `GET {{baseUrl}}/recommendations/1` -> returns top 20 matches with score and reasons.
5. **Coordinator Approval:** Authenticate as `coordinator@ojterm.test`, send `PATCH {{baseUrl}}/coordinator/applications/1` with `{"action": "Approve", "comment": "Verified"}`.
6. **Partner Screening:** Authenticate as `partner1@ojterm.test`, send `GET {{baseUrl}}/partner/postings/1/applicants` -> returns approved applicant.

---

## 11. Known System Boundaries & Limitations

1. **Deterministic Rule Engine:** The recommendation algorithm is explicitly rule-based (+40 program, +30 skills, +20 location, +10 interests) rather than statistical ML to guarantee determinism, interpretability, and under-3-second execution.
2. **Local Document Storage:** Endorsement files are stored on server disk (`uploads/applications/`) rather than external S3/Cloud buckets for academic lab submission simplicity.
3. **Single School Deployment:** System is architected for a single academic institution with department-level grouping.

---

*OJTerm is submitted in partial fulfillment of the requirements for ITPD4 Software Engineering Prefinal Examination by Team DUTERTECH.*
