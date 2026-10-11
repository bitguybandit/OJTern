const { sequelize, Skill, InternshipPosting, CompanyProfile, StudentProfile, PostingSkillRequirement } = require('../models');
const { computeRecommendationsForProfile } = require('../modules/matching/matching.service');

async function runVolumeBenchmark() {
  console.log('=== NFR-03 Artificial Volume Test (1,000 Postings, 100 Skills) ===');
  await sequelize.authenticate();

  // 1. Get an existing company
  const company = await CompanyProfile.findOne();
  if (!company) {
    console.error('No company profile found in database.');
    process.exit(1);
  }

  // 2. Ensure at least 100 skills exist
  console.log('Generating up to 100 benchmark skills...');
  const existingSkills = await Skill.findAll();
  const neededSkills = 100 - existingSkills.length;
  if (neededSkills > 0) {
    const bulkSkills = [];
    for (let i = 1; i <= neededSkills; i++) {
      bulkSkills.push({ SkillName: `BenchmarkSkill_${Date.now()}_${i}` });
    }
    await Skill.bulkCreate(bulkSkills, { ignoreDuplicates: true });
  }
  const allSkills = await Skill.findAll({ limit: 100 });
  console.log(`✓ Skills count: ${allSkills.length}`);

  // 3. Count postings, insert up to 1,000 postings
  const currentPostingsCount = await InternshipPosting.count();
  console.log(`Current postings in DB: ${currentPostingsCount}`);

  if (currentPostingsCount < 1000) {
    const toCreate = 1000 - currentPostingsCount;
    console.log(`Inserting ${toCreate} artificial postings...`);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const dateStr = futureDate.toISOString().split('T')[0];

    const bulkPostings = [];
    const programs = ['BSIT', 'BSCS', 'BSIS', 'BSECE'];
    const locations = ['Iloilo City', 'Cebu City', 'Manila', 'Davao City'];

    for (let i = 1; i <= toCreate; i++) {
      bulkPostings.push({
        CompanyID: company.CompanyID,
        Title: `Artificial Benchmark Internship #${i}`,
        Description: `Software engineering internship focusing on modern web development, algorithms, testing, and cloud infrastructure keywords #${i}`,
        Slots: (i % 5) + 1,
        RequiredProgram: programs[i % programs.length],
        Location: locations[i % locations.length],
        ApplicationDeadline: dateStr,
        Status: 'Active'
      });
    }

    // Insert in batches of 250
    const batchSize = 250;
    for (let i = 0; i < bulkPostings.length; i += batchSize) {
      await InternshipPosting.bulkCreate(bulkPostings.slice(i, i + batchSize));
    }
    console.log(`✓ Inserted ${toCreate} postings.`);
  }

  // 4. Test StudentProfile 1 recommendations
  const student = await StudentProfile.findOne();
  if (!student) {
    console.error('No student profile found to test.');
    process.exit(1);
  }

  console.log(`Testing recommendation latency for Student Profile ID: ${student.ProfileID}...`);
  const startTime = Date.now();
  const recommendations = await computeRecommendationsForProfile(student.ProfileID);
  const elapsedMs = Date.now() - startTime;

  console.log(`✓ Computed ${recommendations.length} recommendations in ${elapsedMs} ms.`);
  if (elapsedMs < 3000) {
    console.log(`\n>>> PASS: Latency (${elapsedMs} ms) is well within the 3,000 ms SLA requirement! <<<`);
  } else {
    console.warn(`\n>>> WARNING: Latency (${elapsedMs} ms) exceeded 3,000 ms SLA! <<<`);
  }

  process.exit(0);
}

runVolumeBenchmark().catch(err => {
  console.error('Volume test error:', err);
  process.exit(1);
});
