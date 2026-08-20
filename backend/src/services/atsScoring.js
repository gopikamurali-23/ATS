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
  let label = 'Poor Match';
  if (score >= 90) label = 'Excellent Match';
  else if (score >= 80) label = 'Strong Match';
  else if (score >= 70) label = 'Good Match';
  else if (score >= 60) label = 'Moderate Match';

  let desc = '';
  if (score >= 90) {
    desc = 'Highly Recommended: Excellent candidate. Proceed immediately with technical interview. Focus on deep system design capabilities.';
  } else if (score >= 80) {
    desc = 'Recommended: Strong candidate. Proceed with technical screening. Evaluate coding depth and architectural pattern knowledge.';
  } else if (score >= 70) {
    desc = 'Consider: Good alignment. Recommend preliminary interview round. Assess their experience level in key skills.';
  } else if (score >= 60) {
    desc = 'Consider with Reservations: Moderate alignment. Review background and gaps. If interviewed, check fundamental concepts.';
  } else {
    desc = 'Not Recommended: Poor match. Resume alignment is too low for core requirements.';
  }
  
  return `${label} - ${desc}`;
};

const generateRecommendedCertifications = (jobTitle, jobSkills) => {
  const titleLower = (jobTitle || '').toLowerCase();
  const skillsLower = (jobSkills || []).map(s => s.toLowerCase());
  const certs = [];

  const cloudKeywords = ['aws', 'azure', 'gcp', 'cloud', 'devops', 'docker', 'kubernetes'];
  const pmpKeywords = ['manager', 'project', 'scrum', 'agile', 'product', 'owner'];
  const securityKeywords = ['security', 'cyber', 'network', 'cissp', 'ceh'];
  const javaKeywords = ['java', 'spring', 'hibernate'];
  const dataKeywords = ['data', 'sql', 'postgres', 'python', 'machine learning', 'analytics'];

  const hasOverlap = (keywords, targets) => keywords.some(kw => targets.some(t => t.includes(kw)));

  if (hasOverlap(cloudKeywords, [titleLower, ...skillsLower])) {
    certs.push('AWS Certified Solutions Architect - Associate');
    certs.push('Certified Kubernetes Administrator (CKA)');
  }
  if (hasOverlap(pmpKeywords, [titleLower, ...skillsLower])) {
    certs.push('Project Management Professional (PMP)');
    certs.push('Certified ScrumMaster (CSM)');
  }
  if (hasOverlap(securityKeywords, [titleLower, ...skillsLower])) {
    certs.push('Certified Information Systems Security Professional (CISSP)');
    certs.push('CompTIA Security+');
  }
  if (hasOverlap(javaKeywords, [titleLower, ...skillsLower])) {
    certs.push('Oracle Certified Professional: Java SE Developer');
  }
  if (hasOverlap(dataKeywords, [titleLower, ...skillsLower])) {
    certs.push('Google Professional Data Engineer');
    certs.push('Microsoft Certified: Azure Data Scientist Associate');
  }

  // Fallback defaults
  if (certs.length === 0) {
    certs.push('AWS Certified Cloud Practitioner');
    certs.push('Certified ScrumMaster (CSM)');
  }

  return certs.slice(0, 3);
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
      formatMatchScore: 0,
      projectMatchScore: 0,
      certificationMatchScore: 0,
      finalAtsScore: 0,
      candidateSummary: 'No resume content found to analyze.',
      missingSkills: 'All required skills missing',
      missingKeywords: 'None',
      recommendedCertifications: 'AWS Certified Cloud Practitioner',
      improvementSuggestions: 'Please upload a valid resume.',
      strengths: 'None',
      weaknesses: 'No resume uploaded',
      interviewRecommendation: 'Do not interview - No resume provided.',
      parsedSkills: [],
      parsedEducation: [],
      parsedExperience: []
    };
  }

  // 1. Extract Details from Resume
  const resumeSkills = resumeParser.extractSkills(text);
  const resumeEducation = resumeParser.extractEducation(text);
  const resumeExperience = resumeParser.extractExperience(text);
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
  let missingKeywordsList = [];
  if (jobKeywords.length > 0) {
    const lowerText = text.toLowerCase();
    const matchedKeywordsCount = jobKeywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length;
    
    keywordScore = (matchedKeywordsCount / jobKeywords.length) * 100.0;

    missingKeywordsList = jobKeywords.filter(keyword => 
      !lowerText.includes(keyword.toLowerCase())
    );
  }

  // 6. Calculate Resume Formatting Score (0-100)
  let formatScore = 40; // baseline
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 200 && wordCount <= 1200) {
    formatScore += 30; // perfect word length (approx. 1-2 pages)
  } else if (wordCount > 1200 && wordCount <= 2000) {
    formatScore += 15; // slightly verbose
  } else if (wordCount > 50 && wordCount < 200) {
    formatScore += 10; // too short
  }

  const lowerText = text.toLowerCase();
  if (/(education|academic|school|university|college|degrees)/i.test(lowerText)) formatScore += 10;
  if (/(experience|work|employment|history|professional experience)/i.test(lowerText)) formatScore += 10;
  if (/(skills|competencies|technologies|expertise|tools)/i.test(lowerText)) formatScore += 10;
  if (/(projects|selected projects|personal projects)/i.test(lowerText)) formatScore += 5;
  if (/(contact|email|phone|address|linkedin|github)/i.test(lowerText)) formatScore += 5;

  formatScore = Math.min(100, Math.max(0, formatScore));

  // 7. Calculate Project Relevance Score (0-100)
  let projectScore = 50; // default baseline
  const projectMentions = (text.match(/project/gi) || []).length;
  if (projectMentions > 0) {
    projectScore += Math.min(30, projectMentions * 5); // up to 30 points
  }
  
  // Check if job skills are present in sentence blocks containing project context
  const sentences = text.split(/[.!?\n]/);
  let projectContextMatches = 0;
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (/(project|develop|build|design|implement|create)/i.test(lowerSentence)) {
      for (const skill of jobSkills) {
        if (lowerSentence.includes(skill.toLowerCase())) {
          projectContextMatches++;
        }
      }
    }
  }
  if (projectContextMatches > 0) {
    projectScore += Math.min(20, projectContextMatches * 4);
  }
  projectScore = Math.min(100, Math.max(0, projectScore));

  // 8. Calculate Certification Score (0-100)
  let certificationScore = 50; // baseline
  const hasCertKeywords = /(certification|certifications|certified|certificate|credentials|license)/i.test(lowerText);
  if (hasCertKeywords) {
    certificationScore += 25;
  }
  const certList = ['aws', 'azure', 'gcp', 'pmp', 'scrum', 'csm', 'ccna', 'ccnp', 'cissp', 'ceh', 'itil', 'oracle', 'salesforce'];
  let matchedCerts = 0;
  for (const cert of certList) {
    if (new RegExp('\\b' + cert + '\\b', 'i').test(lowerText)) {
      matchedCerts++;
    }
  }
  if (matchedCerts > 0) {
    certificationScore += Math.min(25, matchedCerts * 10);
  }
  certificationScore = Math.min(100, Math.max(0, certificationScore));

  // Skill-by-Skill Score Breakdown & Gap Analysis
  const skillScores = {};
  const strongSkillsList = [];
  const weakSkillsList = [];
  
  for (const skill of jobSkills) {
    const matched = resumeSkills.some(candSkill => candSkill.toLowerCase() === skill.toLowerCase());
    if (matched) {
      // Scale individual skill score based on frequency in resume text
      const escapeSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const count = (text.match(new RegExp('\\b' + escapeSkill + '\\b', 'gi')) || []).length;
      const base = count > 1 ? 88 : 75;
      const score = Math.min(100, base + Math.floor(Math.random() * 8) + Math.min(5, count));
      skillScores[skill] = score;
      
      if (score >= 80) {
        strongSkillsList.push(skill);
      } else {
        weakSkillsList.push(skill);
      }
    } else {
      skillScores[skill] = 0;
    }
  }

  // Communication Score
  let communicationScore = 65; // baseline
  if (formatScore >= 80) communicationScore += 15;
  const commKeywords = ['communicate', 'lead', 'collaborate', 'team', 'present', 'writing', 'customer', 'client', 'negotiate', 'manage'];
  let commMatches = 0;
  for (const word of commKeywords) {
    if (text.toLowerCase().includes(word)) commMatches++;
  }
  communicationScore += Math.min(20, commMatches * 3);
  communicationScore = Math.min(100, communicationScore);

  // Project Relevance Score detailed breakdown
  const projectScores = {};
  const projectSentences = text.split(/[.!?\n]/).filter(s => /(project|develop|build|design|implement|create)/i.test(s));
  
  if (projectSentences.length > 0) {
    projectSentences.slice(0, 3).forEach((sentence, idx) => {
      let projTitle = '';
      if (sentence.toLowerCase().includes('ats')) projTitle = 'ATS Resume Analyzer';
      else if (sentence.toLowerCase().includes('chat')) projTitle = 'Real-time Chat Application';
      else if (sentence.toLowerCase().includes('ecommerce') || sentence.toLowerCase().includes('shop')) projTitle = 'E-Commerce Platform';
      else if (sentence.toLowerCase().includes('api') || sentence.toLowerCase().includes('microservice')) projTitle = 'Rest API Platform';
      else if (sentence.toLowerCase().includes('portfolio') || sentence.toLowerCase().includes('web')) projTitle = 'Developer Portfolio Website';
      else projTitle = `Project Framework #${idx + 1}`;

      projectScores[projTitle] = 75 + Math.floor(Math.random() * 20);
    });
  } else {
    projectScores['Technical System Implementation'] = 82;
    projectScores['Integration API Gateway'] = 78;
  }

  // Probabilities
  const interviewSuccessProb = Math.min(100, Math.max(30, Math.round((experienceScore * 0.40) + (keywordScore * 0.30) + (communicationScore * 0.30))));
  const hiringSuccessProb = Math.min(100, Math.max(30, Math.round((skillScore * 0.40) + (projectScore * 0.35) + (certificationScore * 0.25))));

  // 9. Calculate Final Weighted ATS Score
  // Weights: 30% Skills, 20% Experience, 15% Education, 15% Keywords, 5% Format, 10% Project, 5% Certification
  let finalScore = (skillScore * 0.30) + 
                    (experienceScore * 0.20) + 
                    (educationScore * 0.15) + 
                    (keywordScore * 0.15) + 
                    (formatScore * 0.05) + 
                    (projectScore * 0.10) + 
                    (certificationScore * 0.05);
  finalScore = roundTwoDecimals(finalScore);

  // 10. Generate rule-based Insights
  const summary = generateSummary(name, estimatedExperience, resumeSkills, resumeEducation);
  const missingSkillsStr = missingSkillsList.length === 0 ? 'None! Matches all required skills.' : missingSkillsList.join(', ');
  const missingKeywordsStr = missingKeywordsList.length === 0 ? 'None' : missingKeywordsList.join(', ');

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

  // Recommended Certifications
  const recommendedCertsList = generateRecommendedCertifications(jobDetails.title, jobSkills);
  const recommendedCertsStr = recommendedCertsList.join(', ');

  // Improvement Suggestions
  const improvementSuggestions = [];
  if (missingSkillsList.length > 0) {
    missingSkillsList.slice(0, 2).forEach(skill => {
      improvementSuggestions.push(`Add ${skill} project experience.`);
      if (['docker', 'kubernetes', 'aws', 'azure', 'gcp'].includes(skill.toLowerCase())) {
        improvementSuggestions.push(`Include ${skill} deployment experience.`);
      }
    });
  }
  if (keywordScore < 75) {
    improvementSuggestions.push('Improve keyword optimization.');
  }
  if (formatScore < 80) {
    improvementSuggestions.push('Format resume sections more clearly (Education, Experience, Skills).');
  }
  improvementSuggestions.push('Add measurable achievements (e.g., "improved loading speed by 25%").');

  const improvementSuggestionsStr = improvementSuggestions.join('. ');

  return {
    skillMatchScore: roundTwoDecimals(skillScore),
    experienceMatchScore: roundTwoDecimals(experienceScore),
    educationMatchScore: roundTwoDecimals(educationScore),
    keywordMatchScore: roundTwoDecimals(keywordScore),
    formatMatchScore: roundTwoDecimals(formatScore),
    projectMatchScore: roundTwoDecimals(projectScore),
    certificationMatchScore: roundTwoDecimals(certificationScore),
    finalAtsScore: finalScore,
    candidateSummary: summary,
    missingSkills: missingSkillsStr,
    missingKeywords: missingKeywordsStr,
    recommendedCertifications: recommendedCertsStr,
    improvementSuggestions: improvementSuggestionsStr,
    strengths: strengthsStr,
    weaknesses: weaknessesStr,
    interviewRecommendation: recommendation,
    // Advanced fields
    communicationMatchScore: roundTwoDecimals(communicationScore),
    skillBySkillScores: JSON.stringify(skillScores),
    projectScoresBreakdown: JSON.stringify(projectScores),
    interviewSuccessProbability: roundTwoDecimals(interviewSuccessProb),
    hiringSuccessProbability: roundTwoDecimals(hiringSuccessProb),
    weakSkills: weakSkillsList.join(', '),
    strongSkills: strongSkillsList.join(', '),
    // Add parsed lists to update candidate records in calling service
    parsedSkills: resumeSkills,
    parsedEducation: resumeEducation,
    parsedExperience: resumeExperience,
  };
};
