import * as resumeParser from './resumeParser.js';

const getEducationRank = (edu) => {
  if (!edu) return 0;
  const lower = edu.toLowerCase();
  if (lower.includes('phd') || lower.includes('doctorate')) return 4;
  if (lower.includes('master') || lower.includes('m.s') || lower.includes('mtech')) return 3;
  if (lower.includes('bachelor') || lower.includes('b.s') || lower.includes('btech') || lower.includes('degree')) return 2;
  if (lower.includes('associate') || lower.includes('diploma')) return 1;
  return 0;
};

const getEducationRankFromText = (text) => {
  if (!text) return 0;
  const lower = text.toLowerCase();
  if (lower.includes('ph.d') || lower.includes('phd') || lower.includes('doctor')) return 4;
  if (lower.includes('master') || lower.includes('m.s.') || lower.includes('ms') || lower.includes('m.b.a') || lower.includes('mba') || lower.includes('mtech')) return 3;
  if (lower.includes('bachelor') || lower.includes('b.s.') || lower.includes('bs') || lower.includes('b.a.') || lower.includes('ba') || lower.includes('btech')) return 2;
  if (lower.includes('associate') || lower.includes('diploma')) return 1;
  return 0;
};

const getEducationMatchScore = (educationEntries, requiredEdu) => {
  if (!requiredEdu || requiredEdu.trim() === '' || requiredEdu.toLowerCase() === 'any') {
    return 100.0;
  }

  const requiredRank = getEducationRank(requiredEdu);
  let maxCandidateRank = 0;

  for (const entry of educationEntries) {
    maxCandidateRank = Math.max(maxCandidateRank, getEducationRankFromText(entry));
  }

  if (maxCandidateRank >= requiredRank) {
    return 100.0;
  } else if (maxCandidateRank > 0) {
    return (maxCandidateRank / requiredRank) * 100.0;
  } else {
    return 40.0; // Baseline if candidate has education entries but rank is unidentified
  }
};

const generateSummary = (name, experience, skills, education) => {
  let summary = `${name} is a professional with approximately ${experience} years of experience in the industry. `;
  
  if (skills && skills.length > 0) {
    summary += `Their key technical competencies include ${skills.slice(0, 6).join(', ')}. `;
  }

  if (education && education.length > 0) {
    summary += `They have educational credentials including: ${education[0]}.`;
  }
  
  return summary;
};

const generateRecommendation = (score, missingSkills) => {
  if (score >= 85) {
    return 'Strongly Recommend: Excellent candidate. Proceed immediately with technical interview. Focus questions on deep architecture and how they apply their skills.';
  } else if (score >= 70) {
    const skillsText = missingSkills.length === 0 ? 'None' : missingSkills.join(', ');
    return `Recommend: Good candidate. Schedule a preliminary interview. Assess their experience levels and ask basic questions about the following missing skills: ${skillsText}.`;
  } else if (score >= 50) {
    const skillsText = missingSkills.length === 0 ? 'required stack' : missingSkills.join(', ');
    return `Potential Match: Consider with reservations. Resume lacks direct alignment in some key areas. If interviewed, focus heavily on fundamental concepts and check willingness to learn ${skillsText}.`;
  } else {
    return "Do Not Proceed: Low overall alignment (below 50% match score). Background doesn't match the core requirements of this role.";
  }
};

const roundTwoDecimals = (num) => {
  return Math.round(num * 100.0) / 100.0;
};

export const analyzeApplication = (applicationText, jobDetails, candidateDetails) => {
  const text = applicationText;
  const name = `${candidateDetails.first_name} ${candidateDetails.last_name}`;

  if (!text || text.trim() === '') {
    return {
      skillMatchScore: 0,
      experienceMatchScore: 0,
      educationMatchScore: 0,
      keywordMatchScore: 0,
      finalAtsScore: 0,
      candidateSummary: 'No resume content found to analyze.',
      missingSkills: 'All required skills missing',
      strengths: 'None',
      weaknesses: 'No resume uploaded',
      interviewRecommendation: 'Do not interview - No resume provided.'
    };
  }

  // 1. Extract Details from Resume
  const resumeSkills = resumeParser.extractSkills(text);
  const resumeEducation = resumeParser.extractEducation(text);
  const estimatedExperience = resumeParser.estimateYearsOfExperience(text);

  // 2. Calculate Skill Match
  const jobSkills = jobDetails.skillsRequired || [];
  let skillScore = 100.0;
  let missingSkillsList = [];
  
  if (jobSkills.length > 0) {
    const matchedSkillsCount = jobSkills.filter(reqSkill => 
      resumeSkills.some(candSkill => candSkill.toLowerCase() === reqSkill.toLowerCase())
    ).length;
    
    skillScore = (matchedSkillsCount / jobSkills.length) * 100.0;
    
    missingSkillsList = jobSkills.filter(reqSkill => 
      !resumeSkills.some(candSkill => candSkill.toLowerCase() === reqSkill.toLowerCase())
    );
  }

  // 3. Calculate Experience Match
  const requiredExp = jobDetails.experienceRequiredYears;
  let experienceScore = 100.0;
  if (requiredExp > 0) {
    experienceScore = (estimatedExperience / requiredExp) * 100.0;
    if (experienceScore > 100.0) {
      experienceScore = 100.0; // Cap at 100%
    }
  }

  // 4. Calculate Education Match
  const requiredEdu = jobDetails.educationRequired;
  const educationScore = getEducationMatchScore(resumeEducation, requiredEdu);

  // 5. Calculate Keyword Match
  const jobKeywords = jobDetails.keywords || [];
  let keywordScore = 100.0;
  if (jobKeywords.length > 0) {
    const lowerText = text.toLowerCase();
    const matchedKeywordsCount = jobKeywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length;
    
    keywordScore = (matchedKeywordsCount / jobKeywords.length) * 100.0;
  }

  // 6. Calculate Final Weighted ATS Score
  // Weights: 40% Skills, 30% Experience, 15% Education, 15% Keywords
  let finalScore = (skillScore * 0.40) + (experienceScore * 0.30) + (educationScore * 0.15) + (keywordScore * 0.15);
  finalScore = roundTwoDecimals(finalScore);

  // 7. Generate rule-based Insights
  const summary = generateSummary(name, estimatedExperience, resumeSkills, resumeEducation);
  const missingSkillsStr = missingSkillsList.length === 0 ? 'None! Matches all required skills.' : missingSkillsList.join(', ');

  const strengths = [];
  const weaknesses = [];

  if (estimatedExperience >= requiredExp) {
    strengths.push(`Meets or exceeds the required experience of ${requiredExp} years (has ${estimatedExperience} years).`);
  } else {
    weaknesses.push(`Experience level (${estimatedExperience} years) is below the required ${requiredExp} years.`);
  }

  if (skillScore >= 75) {
    strengths.push(`Strong technical alignment with ${Math.round(skillScore)}% of required skills matched.`);
  } else if (skillScore < 40) {
    weaknesses.push(`Low skill match (${Math.round(skillScore)}%). Lacks critical required skills.`);
  }

  if (educationScore >= 90) {
    strengths.push('Education profile meets the educational criteria for this role.');
  } else {
    weaknesses.push(`Educational qualifications may be lower than the preferred level: ${requiredEdu}`);
  }

  if (keywordScore >= 70) {
    strengths.push('Resume contains high keyword density matching the job profile.');
  }

  const strengthsStr = strengths.length === 0 ? 'General match profile.' : strengths.join('. ');
  const weaknessesStr = weaknesses.length === 0 ? 'No critical mismatches detected.' : weaknesses.join('. ');
  const recommendation = generateRecommendation(finalScore, missingSkillsList);

  return {
    skillMatchScore: roundTwoDecimals(skillScore),
    experienceMatchScore: roundTwoDecimals(experienceScore),
    educationMatchScore: roundTwoDecimals(educationScore),
    keywordMatchScore: roundTwoDecimals(keywordScore),
    finalAtsScore: finalScore,
    candidateSummary: summary,
    missingSkills: missingSkillsStr,
    strengths: strengthsStr,
    weaknesses: weaknessesStr,
    interviewRecommendation: recommendation,
    // Add parsed lists to update candidate records in calling service
    parsedSkills: resumeSkills,
    parsedEducation: resumeEducation,
    parsedExperience: resumeExperience,
  };
};
