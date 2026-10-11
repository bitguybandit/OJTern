# OJTerm — Smart Web-Based OJT Matching Platform and Recommendation System

> A centralized, rule-based platform that connects OJT students with internship
> opportunities suited to their academic program, technical skills, interests,
> and preferred work location — while giving coordinators and industry partners
> the tools to manage postings, applications, and placement reporting in one system.

![Status](https://img.shields.io/badge/status-prefinal%20build-blue)
![Course](https://img.shields.io/badge/course-ITPD4%20Software%20Engineering-green)
![Team](https://img.shields.io/badge/team-DUTERTECH-orange)
![License](https://img.shields.io/badge/license-academic-lightgrey)

---

## 📌 About the Project

Many higher education institutions require students to complete an On-the-Job
Training (OJT) program before graduation. The current process is manual,
unorganized, and dependent on referrals or social media postings — causing
delayed placements, mismatched student–company assignments, and extra workload
for OJT coordinators.

**OJTerm** solves this by providing:

- 🎓 **For Students** — profile builder, ranked internship recommendations,
  application submission with a mandatory endorsement document, and status tracking.
- 🏢 **For Industry Partners** — company registration, internship slot posting,
  and screening of coordinator-approved applicants only.
- 📋 **For OJT Coordinators** — application review, approve / reject / return
  workflow, and monthly placement reports by company and program.
- 🛠️ **For School Administrators** — user management, platform monitoring, and
  audit logs.

The recommendation engine is **rule-based** (academic program, skills, and
location). Advanced AI / machine-learning matching is explicitly out of scope.

---

## 🎯 Target Users

| Role | What They Do in the System |
|------|---------------------------|
| **OJT Student** | Builds profile, receives recommendations, applies, tracks status |
| **Industry Partner** | Registers company, posts slots, screens approved applicants |
| **OJT Coordinator** | Reviews applications, approves/rejects, generates reports |
| **School Administrator** | Manages users, monitors activity, views audit logs |

---

## 🧩 Core Features

- JWT authentication with role-based access control (4 roles)
- Student profile with skills, program, interests, and preferred location
- Company registration with coordinator verification
- Internship posting with slots, required program, and required skills
- **Rule-based recommendation engine** (program + skills + location, ranked)
- Application submission with **mandatory endorsement document** (BR-01)
- Coordinator-only approval workflow (BR-02)
- Partner screening limited to coordinator-approved applicants (BR-03)
- In-system + email status notifications
- Monthly placement report grouped by company and academic program

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Axios, plain CSS |
| Backend | Node.js, Express, JWT, bcrypt, Multer |
| Database | MySQL with Sequelize ORM (11 entities, 2 junction tables) |
| Storage | Local disk (cloud storage deferred) |
| Email | Nodemailer (Ethereal in dev) |
| Tooling | Git, npm, Postman, dotenv |

---

## 📚 Documentation

Full project documentation is included in this repository:

- `01_Project_Proposal.pdf` — Week 1 approved concept
- `02_Methodology_and_Lifecycle_Plan.pdf` — Week 2 Agile Scrum + Prototyping plan
- `03_Elicitation_and_SRS.pdf` — Week 3 requirements specification
- `04_Use_Case_Modeling.pdf` — Week 4 actors, use cases, user stories
- `05_Design_Architecture_ERD.pdf` — Weeks 5–6 design package
- `06_Week8_Project_Planning.pdf` — WBS, schedule, risk register
- `07_TestII_Documentation.pdf` — Prefinal Test II submission

---

## 👥 Team DUTERTECH

| Member | Role |
|--------|------|
| **Rico Gervero** | Project Manager / Scrum Master / Team Leader |
| **Ric Andrei Valenzuela** | System Analyst & Integration Lead |
| **Jeff Gentapanan** | UI/UX Designer |
| **Jhodie Alyssa Ladran** | Front-End Developer |
| **John Lester Tiangao** | Back-End Developer |
| **Naethan James Trinidad** | Database Developer |
| **Christina Rojo** | QA / Tester |

**Course:** ITPD4 – Software Engineering
**Section:** Section 1
**Instructor:** Mohamed Mogib P. Elkordy
**School:** Western Institute of Technology
**1st Semester, A.Y. 2026–2027**

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8
- npm or yarn

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/ITPD4-DUTERTECH-OJTerm.git
cd ITPD4-DUTERTECH-OJTerm

# 2. Backend setup
cd server
cp .env.example .env      # fill in your DB credentials
npm install
npm run migrate
npm run seed              # demo users, skills, postings, applications
npm run dev               # starts on http://localhost:5000

# 3. Frontend setup (in a new terminal)
cd ../client
npm install
npm run dev               # starts on http://localhost:5173
