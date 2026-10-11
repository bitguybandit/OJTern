const { Op } = require('sequelize');
const { StudentProfile, InternshipPosting, CompanyProfile, Skill } = require('../../models');

/**
 * Deterministic Rule-Based Recommendation Engine (FR-04)
 */
const computeRecommendationsForProfile = async (profileId) => {
  // 1. Load student profile with skills
  const student = await StudentProfile.findByPk(profileId, {
    include: [{ model: Skill, as: 'skills' }]
  });

  if (!student) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // 2. Load all Active postings whose deadline >= today
  const postings = await InternshipPosting.findAll({
    where: {
      Status: 'Active',
      ApplicationDeadline: {
        [Op.gte]: todayStr
      }
    },
    include: [
      {
        model: CompanyProfile,
        as: 'company'
      },
      {
        model: Skill,
        as: 'skills'
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const studentProgram = (student.AcademicProgram || '').toLowerCase().trim();
  const studentLocation = (student.PreferredLocation || '').toLowerCase().trim();
  const studentSkillNames = new Set(
    (student.skills || []).map(s => s.SkillName.toLowerCase().trim())
  );

  // Parse student interest keywords (minimum length 3)
  const rawInterests = (student.Interests || '').toLowerCase();
  const interestKeywords = rawInterests
    .split(/[,;\s]+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3);

  const results = [];

  // 3. For each posting compute score
  for (const posting of postings) {
    let score = 0;
    const reasons = [];

    // Rule A: Program Match (+40)
    const postingProgram = (posting.RequiredProgram || '').toLowerCase().trim();
    const isProgramMatch = postingProgram === studentProgram ||
      postingProgram.includes(studentProgram) ||
      studentProgram.includes(postingProgram) ||
      postingProgram.split(/[\/,]/).some(p => p.trim() === studentProgram);

    if (isProgramMatch) {
      score += 40;
      reasons.push(`Academic Program match: ${posting.RequiredProgram} aligns with your program`);
    }

    // Rule B: Skills Match (+30 * matching / required)
    const requiredSkills = posting.skills || [];
    const requiredCount = requiredSkills.length;
    let matchingSkillCount = 0;
    const matchedSkillNames = [];

    if (requiredCount > 0) {
      for (const reqSkill of requiredSkills) {
        const name = reqSkill.SkillName.toLowerCase().trim();
        if (studentSkillNames.has(name)) {
          matchingSkillCount++;
          matchedSkillNames.push(reqSkill.SkillName);
        }
      }
      const skillScore = Math.round(30 * (matchingSkillCount / requiredCount));
      score += skillScore;
      if (matchingSkillCount > 0) {
        reasons.push(`Skills match: ${matchingSkillCount}/${requiredCount} required skills matched (${matchedSkillNames.join(', ')})`);
      }
    } else {
      // If posting has no specific skill requirements, award full skill points
      score += 30;
      reasons.push('Open skill requirements');
    }

    // Rule C: Location Match (+20)
    const postingLocation = (posting.Location || '').toLowerCase().trim();
    const isLocationMatch = postingLocation.includes(studentLocation) || studentLocation.includes(postingLocation);

    if (isLocationMatch) {
      score += 20;
      reasons.push(`Location match: Located in ${posting.Location}`);
    }

    // Rule D: Interests Overlap (+10)
    const descText = `${posting.Description || ''} ${posting.Title || ''}`.toLowerCase();
    const matchedInterests = interestKeywords.filter(kw => descText.includes(kw));

    if (matchedInterests.length > 0) {
      score += 10;
      reasons.push(`Interest alignment: Matches topics (${matchedInterests.slice(0, 3).join(', ')})`);
    }

    // Cap total score at 100
    const finalScore = Math.min(100, Math.round(score));

    // 4. Drop postings with score < 20
    if (finalScore >= 20) {
      results.push({
        posting,
        score: finalScore,
        reasons
      });
    }
  }

  // 5. Sort descending by score, tiebreak by posting createdAt DESC
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.posting.createdAt) - new Date(a.posting.createdAt);
  });

  // 6. Return top 20
  return results.slice(0, 20);
};

// In-memory cache for 3s fallback if needed
const recommendationCache = new Map();

/**
 * Wraps recommendation computation with a hard 3000ms timeout (NFR-03).
 */
const getRecommendationsWithTimeout = async (profileId) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), 3000)
  );

  try {
    const computed = await Promise.race([
      computeRecommendationsForProfile(profileId),
      timeoutPromise
    ]);
    recommendationCache.set(profileId, computed);
    return computed;
  } catch (err) {
    if (err.message === 'TIMEOUT') {
      console.warn(`[RECOMMENDATIONS] Calculation exceeded 3000ms timeout for profile ${profileId}. Returning cached/truncated data.`);
      if (recommendationCache.has(profileId)) {
        return recommendationCache.get(profileId);
      }
      // Truncated fallback: fetch basic active postings
      const fallbackPostings = await InternshipPosting.findAll({
        where: { Status: 'Active' },
        limit: 10,
        include: [{ model: CompanyProfile, as: 'company' }, { model: Skill, as: 'skills' }]
      });
      return fallbackPostings.map(posting => ({
        posting,
        score: 50,
        reasons: ['Quick match fallback']
      }));
    }
    throw err;
  }
};

module.exports = {
  computeRecommendationsForProfile,
  getRecommendationsWithTimeout
};
