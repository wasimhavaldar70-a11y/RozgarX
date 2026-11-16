import { Job, CandidateProfile, MatchedCandidate, MatchedJob } from '../types';

/**
 * Intelligent Matching Algorithm for MahaJobs
 * Computes a compatibility score (0-100%) between a Job vacancy and a Candidate Profile
 * based on Skills (40%), Location/District (25%), Experience (20%), and Education (15%).
 */
export function calculateMatch(job: Job, candidate: CandidateProfile): {
  score: number;
  matchReasons: string[];
  isHighMatch: boolean;
} {
  const matchReasons: string[] = [];

  // 1. Skills Matching (Max 40 points)
  let skillsScore = 0;
  const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  const candSummary = (candidate.resumeSummary || '').toLowerCase();

  const matchedSkills: string[] = [];
  if (jobSkills.length > 0) {
    for (const js of jobSkills) {
      const directMatch = candSkills.some(cs => cs.includes(js) || js.includes(cs));
      const summaryMatch = candSummary.includes(js);
      if (directMatch || summaryMatch) {
        matchedSkills.push(js);
      }
    }
    const skillRatio = matchedSkills.length / jobSkills.length;
    skillsScore = Math.round(skillRatio * 40);
    if (matchedSkills.length > 0) {
      matchReasons.push(`Skills match: ${matchedSkills.slice(0, 3).join(', ')}`);
    }
  } else {
    // If job specified no strict skills, baseline general fit
    skillsScore = 25;
  }

  // 2. District & Location Matching (Max 25 points)
  let locationScore = 0;
  const jobDistrict = (job.district || '').toLowerCase().trim();
  const candDistrict = (candidate.district || '').toLowerCase().trim();
  const preferredDistricts = (candidate.preferredDistricts || []).map(d => d.toLowerCase().trim());

  if (jobDistrict && candDistrict && jobDistrict === candDistrict) {
    locationScore = 25;
    matchReasons.push(`Local talent in ${job.district}`);
  } else if (preferredDistricts.includes(jobDistrict)) {
    locationScore = 25;
    matchReasons.push(`Preferred location: ${job.district}`);
  } else if (job.workMode === 'Remote') {
    locationScore = 25;
    matchReasons.push('100% Remote Opportunity');
  } else {
    locationScore = 10;
  }

  // 3. Experience Matching (Max 20 points)
  let experienceScore = 0;
  const candExp = candidate.experience?.totalExperienceYears ?? 0;
  const minExp = job.experienceMinYears ?? 0;
  const maxExp = job.experienceMaxYears ?? 30;

  if (minExp === 0 && (candidate.experience?.isFresher || candExp <= 1)) {
    experienceScore = 20;
    matchReasons.push('Fresher criteria matched');
  } else if (candExp >= minExp && candExp <= maxExp) {
    experienceScore = 20;
    matchReasons.push(`${candExp} yrs exp fits ${minExp}–${maxExp} yrs range`);
  } else if (candExp >= Math.max(0, minExp - 1) && candExp <= maxExp + 2) {
    experienceScore = 12;
    matchReasons.push(`Experience (${candExp} yrs) closely aligns`);
  } else {
    experienceScore = 6;
  }

  // 4. Education & Qualification Matching (Max 15 points)
  let educationScore = 0;
  const jobEdu = (job.educationRequirement || '').toLowerCase();
  const candEdu = (candidate.education?.highestQualification || '').toLowerCase();
  const candDegree = (candidate.education?.degreeName || '').toLowerCase();

  if (
    jobEdu.includes('any') ||
    (candEdu && jobEdu.includes(candEdu)) ||
    (candDegree && jobEdu.includes(candDegree)) ||
    (candEdu && candEdu.includes('graduate') && jobEdu.includes('graduate'))
  ) {
    educationScore = 15;
    matchReasons.push(`Qualification matches (${candidate.education?.highestQualification || 'Graduate'})`);
  } else {
    educationScore = 8;
  }

  // Total Score clamped 0-100
  const totalScore = Math.min(100, Math.max(10, skillsScore + locationScore + experienceScore + educationScore));
  const isHighMatch = totalScore >= 70;

  return {
    score: totalScore,
    matchReasons: matchReasons.length > 0 ? matchReasons : ['General eligibility match'],
    isHighMatch
  };
}

/**
 * Finds and ranks candidates for a given job vacancy (Used in Employer Smart Talent Pool)
 * Masks sensitive contact details (phone, email, exact address) to protect candidate privacy.
 */
export function findMatchingCandidates(
  job: Job,
  allCandidates: CandidateProfile[],
  existingInvitations: { candidateId: string; jobId: string }[] = []
): MatchedCandidate[] {
  const invitedSet = new Set(
    existingInvitations
      .filter(inv => inv.jobId === job.id)
      .map(inv => inv.candidateId)
  );

  const matchedList: MatchedCandidate[] = [];

  for (const cand of allCandidates) {
    // Only match discoverable candidates
    if (cand.isDiscoverable === false) continue;

    const { score, matchReasons, isHighMatch } = calculateMatch(job, cand);

    // Keep candidate contact info privacy-masked in Smart Talent Pool
    const maskedCandidate: CandidateProfile = {
      ...cand,
      mobile: '+91 98XXX XXXXX (Protected)',
      email: `${cand.fullName.toLowerCase().replace(/\s+/g, '.')}***@candidate.rozgarx.com`,
      address: `${cand.city || cand.district}, ${cand.district}, Maharashtra (Full Address Masked)`
    };

    matchedList.push({
      candidate: maskedCandidate,
      matchScore: score,
      matchReasons,
      isHighMatch,
      hasBeenInvited: invitedSet.has(cand.id)
    });
  }

  // Sort descending by highest match score
  return matchedList.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Finds and ranks active jobs for a candidate (Used in Candidate Smart Job Match)
 */
export function findMatchingJobs(
  candidate: CandidateProfile,
  allJobs: Job[]
): MatchedJob[] {
  const activeJobs = allJobs.filter(j => j.status === 'approved');
  const matchedJobs: MatchedJob[] = [];

  for (const job of activeJobs) {
    const { score, matchReasons, isHighMatch } = calculateMatch(job, candidate);
    if (score >= 40) {
      matchedJobs.push({
        job,
        matchScore: score,
        matchReasons,
        isHighMatch
      });
    }
  }

  // Sort descending by match score
  return matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
}

