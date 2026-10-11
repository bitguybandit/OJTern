const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const {
  sequelize,
  User,
  StudentProfile,
  CompanyProfile,
  Skill,
  InternshipPosting,
  Application,
  EndorsementDocument,
  Notification,
  PlacementReport,
  AuditLog
} = require('../models');
const env = require('../config/env');

const runSeeds = async () => {
  console.log('--- Starting Database Seeder ---');
  await sequelize.authenticate();

  // Clean any artificial benchmark records if present
  const { Op } = require('sequelize');
  await InternshipPosting.destroy({ where: { Title: { [Op.like]: 'Artificial Benchmark Internship %' } } });
  await Skill.destroy({ where: { SkillName: { [Op.like]: 'BenchmarkSkill_%' } } });

  const commonPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Skills
  const skillNames = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL',
    'UI/UX Design', 'Networking', 'Data Analysis', 'Figma', 'Git',
    'REST APIs', 'MySQL'
  ];

  const skillMap = {};
  for (const name of skillNames) {
    const [skill] = await Skill.findOrCreate({
      where: { SkillName: name }
    });
    skillMap[name] = skill;
  }
  console.log(`✓ Seeded ${skillNames.length} skills.`);

  // 2. Seed Users
  const usersData = [
    { name: 'Juan Dela Cruz (Student 1)', email: 'student1@ojterm.test', role: 'Student' },
    { name: 'Maria Santos (Student 2)', email: 'student2@ojterm.test', role: 'Student' },
    { name: 'Company A Representative', email: 'partner1@ojterm.test', role: 'IndustryPartner' },
    { name: 'Company B Representative', email: 'partner2@ojterm.test', role: 'IndustryPartner' },
    { name: 'Prof. Allan Reyes (Coordinator)', email: 'coordinator@ojterm.test', role: 'OJTCoordinator' },
    { name: 'System Administrator', email: 'admin@ojterm.test', role: 'SchoolAdministrator' }
  ];

  const userMap = {};
  for (const u of usersData) {
    let user = await User.findOne({ where: { Email: u.email } });
    if (!user) {
      user = await User.create({
        Name: u.name,
        Email: u.email,
        PasswordHash: commonPasswordHash,
        Role: u.role,
        Status: 'active'
      });
    } else {
      user.PasswordHash = commonPasswordHash;
      user.Role = u.role;
      user.Status = 'active';
      await user.save();
    }
    userMap[u.email] = user;
  }
  console.log(`✓ Seeded ${usersData.length} core demo users.`);

  // 3. Seed Student Profiles
  // student1: BSIT, Year 3, skills [JavaScript, React, Node.js, MySQL], preferred location "Iloilo City", interests "Frontend, Web"
  let profile1 = await StudentProfile.findOne({ where: { UserID: userMap['student1@ojterm.test'].UserID } });
  if (!profile1) {
    profile1 = await StudentProfile.create({
      UserID: userMap['student1@ojterm.test'].UserID,
      AcademicProgram: 'BSIT',
      YearLevel: 'Year 3',
      Interests: 'Frontend, Web',
      PreferredLocation: 'Iloilo City',
      ResumePath: null
    });
  } else {
    profile1.AcademicProgram = 'BSIT';
    profile1.YearLevel = 'Year 3';
    profile1.Interests = 'Frontend, Web';
    profile1.PreferredLocation = 'Iloilo City';
    await profile1.save();
  }
  await profile1.setSkills([
    skillMap['JavaScript'],
    skillMap['React'],
    skillMap['Node.js'],
    skillMap['MySQL']
  ]);

  // student2: BSCS, Year 4, skills [Python, SQL, Data Analysis], preferred location "Iloilo City", interests "Data, AI"
  let profile2 = await StudentProfile.findOne({ where: { UserID: userMap['student2@ojterm.test'].UserID } });
  if (!profile2) {
    profile2 = await StudentProfile.create({
      UserID: userMap['student2@ojterm.test'].UserID,
      AcademicProgram: 'BSCS',
      YearLevel: 'Year 4',
      Interests: 'Data, AI',
      PreferredLocation: 'Iloilo City',
      ResumePath: null
    });
  } else {
    profile2.AcademicProgram = 'BSCS';
    profile2.YearLevel = 'Year 4';
    profile2.Interests = 'Data, AI';
    profile2.PreferredLocation = 'Iloilo City';
    await profile2.save();
  }
  await profile2.setSkills([
    skillMap['Python'],
    skillMap['SQL'],
    skillMap['Data Analysis']
  ]);
  console.log('✓ Seeded student profiles and associated skills.');

  // 4. Seed Company Profiles
  // partner1: Company A — Verified
  let companyA = await CompanyProfile.findOne({ where: { UserID: userMap['partner1@ojterm.test'].UserID } });
  if (!companyA) {
    companyA = await CompanyProfile.create({
      UserID: userMap['partner1@ojterm.test'].UserID,
      CompanyName: 'Company A Tech Innovations',
      Industry: 'Information Technology & Software Development',
      OfficeAddress: 'Diversion Road, Mandurriao, Iloilo City',
      ContactPerson: 'John Smith',
      ContactEmail: 'contact@companya.test',
      VerificationStatus: 'Verified'
    });
  } else {
    companyA.VerificationStatus = 'Verified';
    await companyA.save();
  }

  // partner2: Company B — Pending
  let companyB = await CompanyProfile.findOne({ where: { UserID: userMap['partner2@ojterm.test'].UserID } });
  if (!companyB) {
    companyB = await CompanyProfile.create({
      UserID: userMap['partner2@ojterm.test'].UserID,
      CompanyName: 'Company B Data Solutions',
      Industry: 'Data Analytics & Consulting',
      OfficeAddress: 'Jaro Plaza, Iloilo City',
      ContactPerson: 'Sarah Jenkins',
      ContactEmail: 'contact@companyb.test',
      VerificationStatus: 'Pending'
    });
  } else {
    companyB.VerificationStatus = 'Pending';
    await companyB.save();
  }
  console.log('✓ Seeded company profiles (Company A Verified, Company B Pending).');

  // 5. Seed Postings (5+)
  const addDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const postingsData = [
    {
      title: 'Junior Web Developer Intern',
      companyId: companyA.CompanyID,
      description: 'Assist in building modern web applications with responsive user interfaces. Hands-on exposure to frontend frameworks, APIs, and modern UI/UX design.',
      slots: 3,
      requiredProgram: 'BSIT',
      location: 'Iloilo City',
      applicationDeadline: addDays(30),
      skills: ['JavaScript', 'React']
    },
    {
      title: 'Backend Node.js Intern',
      companyId: companyA.CompanyID,
      description: 'Contribute to backend microservices, REST APIs, and database migrations. Exposure to Express, Node.js, and MySQL optimization.',
      slots: 2,
      requiredProgram: 'BSIT',
      location: 'Iloilo City',
      applicationDeadline: addDays(45),
      skills: ['Node.js', 'MySQL']
    },
    {
      title: 'Data Analyst Intern',
      companyId: companyB.CompanyID,
      description: 'Perform exploratory data analysis, reporting, data cleaning, and automated dashboard development using Python and SQL.',
      slots: 1,
      requiredProgram: 'BSCS',
      location: 'Iloilo City',
      applicationDeadline: addDays(20),
      skills: ['Python', 'SQL']
    },
    {
      title: 'Full Stack Web Intern',
      companyId: companyA.CompanyID,
      description: 'Collaborate across full stack web development using modern JavaScript frameworks, relational SQL databases, and cloud workflows.',
      slots: 2,
      requiredProgram: 'BSIT',
      location: 'Iloilo City',
      applicationDeadline: addDays(60),
      skills: ['JavaScript', 'React', 'Node.js']
    },
    {
      title: 'UI/UX & Frontend Intern',
      companyId: companyA.CompanyID,
      description: 'Translate wireframes and Figma designs into accessible, responsive web interfaces using CSS and React component libraries.',
      slots: 2,
      requiredProgram: 'BSIT',
      location: 'Iloilo City',
      applicationDeadline: addDays(25),
      skills: ['Figma', 'UI/UX Design', 'React']
    }
  ];

  const postingRecords = [];
  for (const p of postingsData) {
    let posting = await InternshipPosting.findOne({ where: { Title: p.title, CompanyID: p.companyId } });
    if (!posting) {
      posting = await InternshipPosting.create({
        CompanyID: p.companyId,
        Title: p.title,
        Description: p.description,
        Slots: p.slots,
        RequiredProgram: p.requiredProgram,
        Location: p.location,
        ApplicationDeadline: p.applicationDeadline,
        Status: 'Active'
      });
    }
    const skillInstances = p.skills.map(s => skillMap[s]).filter(Boolean);
    await posting.setSkills(skillInstances);
    postingRecords.push(posting);
  }
  console.log(`✓ Seeded ${postingRecords.length} internship postings with skill requirements.`);

  // 6. Seed Applications
  // student1 -> posting1 with endorsement doc, Status = Approved
  let app1 = await Application.findOne({
    where: { ProfileID: profile1.ProfileID, PostingID: postingRecords[0].PostingID }
  });
  if (!app1) {
    app1 = await Application.create({
      ProfileID: profile1.ProfileID,
      PostingID: postingRecords[0].PostingID,
      Status: 'Approved',
      DateSubmitted: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      DateReviewed: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      ReviewedByCoordinatorID: userMap['coordinator@ojterm.test'].UserID,
      PartnerDecision: 'None',
      FeedbackComment: 'Endorsement document verified and endorsed for Company A review.'
    });
  }

  // Ensure sample endorsement file exists for app1
  const app1Dir = path.join(env.UPLOAD_DIR, 'applications', String(app1.ApplicationID));
  if (!fs.existsSync(app1Dir)) fs.mkdirSync(app1Dir, { recursive: true });
  const app1PdfPath = path.join(app1Dir, 'endorsement_student1.pdf');
  const samplePdfSource = path.join(env.UPLOAD_DIR, 'sample_endorsement.pdf');
  if (fs.existsSync(samplePdfSource)) {
    fs.copyFileSync(samplePdfSource, app1PdfPath);
  }

  let doc1 = await EndorsementDocument.findOne({ where: { ApplicationID: app1.ApplicationID } });
  if (!doc1) {
    await EndorsementDocument.create({
      ApplicationID: app1.ApplicationID,
      FileName: 'endorsement_student1.pdf',
      FilePath: `uploads/applications/${app1.ApplicationID}/endorsement_student1.pdf`,
      FileSize: 1024,
      UploadDate: new Date(Date.now() - 3 * 24 * 3600 * 1000)
    });
  }

  // student2 -> posting3 with endorsement doc, Status = Pending
  let app2 = await Application.findOne({
    where: { ProfileID: profile2.ProfileID, PostingID: postingRecords[2].PostingID }
  });
  if (!app2) {
    app2 = await Application.create({
      ProfileID: profile2.ProfileID,
      PostingID: postingRecords[2].PostingID,
      Status: 'Pending',
      DateSubmitted: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      PartnerDecision: 'None'
    });
  }

  const app2Dir = path.join(env.UPLOAD_DIR, 'applications', String(app2.ApplicationID));
  if (!fs.existsSync(app2Dir)) fs.mkdirSync(app2Dir, { recursive: true });
  const app2PdfPath = path.join(app2Dir, 'endorsement_student2.pdf');
  if (fs.existsSync(samplePdfSource)) {
    fs.copyFileSync(samplePdfSource, app2PdfPath);
  }

  let doc2 = await EndorsementDocument.findOne({ where: { ApplicationID: app2.ApplicationID } });
  if (!doc2) {
    await EndorsementDocument.create({
      ApplicationID: app2.ApplicationID,
      FileName: 'endorsement_student2.pdf',
      FilePath: `uploads/applications/${app2.ApplicationID}/endorsement_student2.pdf`,
      FileSize: 1024,
      UploadDate: new Date(Date.now() - 1 * 24 * 3600 * 1000)
    });
  }
  console.log('✓ Seeded demo applications with endorsement documents.');

  // 7. Seed 3 unread notifications for student1
  await Notification.destroy({ where: { UserID: userMap['student1@ojterm.test'].UserID } });
  await Notification.bulkCreate([
    {
      UserID: userMap['student1@ojterm.test'].UserID,
      Message: 'Welcome to OJTerm! Please review your profile skills to get top matches.',
      Type: 'info',
      IsRead: false,
      DateSent: new Date(Date.now() - 5 * 24 * 3600 * 1000)
    },
    {
      UserID: userMap['student1@ojterm.test'].UserID,
      Message: 'Application received for "Junior Web Developer Intern". Pending coordinator endorsement check.',
      Type: 'info',
      IsRead: false,
      DateSent: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      RelatedApplicationID: app1.ApplicationID
    },
    {
      UserID: userMap['student1@ojterm.test'].UserID,
      Message: 'Your application for "Junior Web Developer Intern" has been APPROVED by the OJT Coordinator!',
      Type: 'success',
      IsRead: false,
      DateSent: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      RelatedApplicationID: app1.ApplicationID
    }
  ]);
  console.log('✓ Seeded 3 unread notifications for student1.');

  // 8. Seed sample initial audit logs
  await AuditLog.create({
    UserID: userMap['coordinator@ojterm.test'].UserID,
    Action: 'COORDINATOR_APPROVE',
    EntityAffected: 'APPLICATION',
    EntityID: String(app1.ApplicationID),
    OldValue: { Status: 'Pending' },
    NewValue: { Status: 'Approved' },
    Timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000)
  });

  console.log('✓ Seeding complete. All demo data is ready for evaluation!');
};

if (require.main === module) {
  runSeeds()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('✗ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = runSeeds;
