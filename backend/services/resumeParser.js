const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const TECH_DICTIONARY = [
  "Java", "Spring Boot", "Spring Data JPA", "Spring Security", "React", "React.js", "Redux",
  "JavaScript", "TypeScript", "Python", "Node.js", "Express", "SQL", "PostgreSQL", "MySQL",
  "MongoDB", "H2", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Microservices", "REST API",
  "GraphQL", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Git", "GitHub", "GitLab",
  "Jenkins", "CI/CD", "JUnit", "Mockito", "C++", "C#", ".NET", "Go", "Golang", "Rust",
  "PHP", "Laravel", "Vue.js", "Angular", "Next.js", "Linux", "System Design", "Agile",
  "Scrum", "Jira", "Kafka", "RabbitMQ", "Redis", "Elasticsearch", "Machine Learning", "AI"
];

const EDUCATION_KEYWORDS = [
  "Bachelor of Science", "Bachelor of Technology", "Bachelor of Engineering", "Bachelor",
  "B.S.", "B.Tech", "B.E.", "B.A.", "Master of Science", "Master of Technology", "Master",
  "M.S.", "M.Tech", "M.E.", "M.B.A.", "Ph.D.", "Doctorate", "Diploma",
  "Computer Science", "Information Technology", "Software Engineering", "Electrical Engineering"
];

async function extractTextFromFile(file) {
  if (!file || !file.buffer) {
    return '';
  }
  const filename = (file.originalname || '').toLowerCase();
  try {
    if (filename.endsWith('.pdf')) {
      const data = await pdfParse(file.buffer);
      return data.text || '';
    } else if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value || '';
    } else {
      return file.buffer.toString('utf-8');
    }
  } catch (err) {
    console.error('Error extracting text from file:', err.message);
    return file.buffer.toString('utf-8');
  }
}

function estimateExperienceYears(text) {
  let maxYears = 1;
  const safeText = text || '';

  // Check for explicit "X+ years", "X years of experience"
  const expPattern = /(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:exp|experience)?/gi;
  let match;
  while ((match = expPattern.exec(safeText)) !== null) {
    const years = parseInt(match[1], 10);
    if (!isNaN(years) && years > maxYears && years <= 35) {
      maxYears = years;
    }
  }

  // Check for year ranges e.g. 2018 - 2023, 2020 - Present
  const rangePattern = /(20\d{2})\s*[-–—]\s*(20\d{2}|present|current)/gi;
  let totalRangeYears = 0;
  const currentYear = 2026;
  while ((match = rangePattern.exec(safeText)) !== null) {
    const start = parseInt(match[1], 10);
    const endGroup = match[2].toLowerCase();
    const end = (endGroup.includes('present') || endGroup.includes('current')) ? currentYear : parseInt(endGroup, 10);
    const diff = end - start;
    if (!isNaN(diff) && diff > 0 && diff <= 25) {
      totalRangeYears += diff;
    }
  }

  return Math.max(maxYears, Math.min(totalRangeYears, 30));
}

function getRequiredSkillsList(requiredSkillsStr) {
  if (!requiredSkillsStr || !requiredSkillsStr.trim()) {
    return [];
  }
  return requiredSkillsStr
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function calculateAtsScore(extractedSkills, matchedSkills, missingSkills, requiredSkills, candidateYears, job) {
  if (!job) {
    return Math.min(100, 50 + (extractedSkills.length * 5));
  }

  let skillScore = 0.0;
  if (requiredSkills.length > 0) {
    skillScore = (matchedSkills.length / requiredSkills.length) * 60.0;
  } else {
    skillScore = Math.min(60.0, extractedSkills.length * 6.0);
  }

  let expScore = 25.0;
  if (job.requiredExperienceYears && job.requiredExperienceYears > 0) {
    const ratio = candidateYears / job.requiredExperienceYears;
    expScore = Math.min(25.0, ratio * 25.0);
  }

  let bonus = 15.0; // Baseline education & keywords match score
  if (matchedSkills.length > 0 && matchedSkills.length === requiredSkills.length) {
    bonus += 5.0;
  }

  const finalScore = Math.round(skillScore + expScore + bonus);
  return Math.max(20, Math.min(99, finalScore));
}

function analyzeResume(fileName, text, job) {
  const safeText = text || '';
  const lowerText = safeText.toLowerCase();

  // 1. Extract skills from tech dictionary
  const extractedSkills = TECH_DICTIONARY.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(lowerText);
  });

  // 2. Extract education
  const foundEducation = EDUCATION_KEYWORDS.filter(edu => lowerText.includes(edu.toLowerCase()));
  const extractedEducation = foundEducation.length === 0
    ? 'Higher Education / Technical Degree'
    : foundEducation.join(', ');

  // 3. Estimate experience years
  const estimatedExperienceYears = estimateExperienceYears(safeText);

  // 4. Calculate ATS Match Score against Job
  const requiredSkillsList = getRequiredSkillsList(job ? job.requiredSkills : '');
  const matchedSkills = [];
  const missingSkills = [];

  if (requiredSkillsList.length > 0) {
    requiredSkillsList.forEach(reqSkill => {
      const trimmedReq = reqSkill.trim();
      const hasSkill = extractedSkills.some(s => s.toLowerCase() === trimmedReq.toLowerCase()) || lowerText.includes(trimmedReq.toLowerCase());
      if (hasSkill) {
        matchedSkills.push(trimmedReq);
      } else {
        missingSkills.push(trimmedReq);
      }
    });
  } else {
    matchedSkills.push(...extractedSkills);
  }

  const atsMatchScore = calculateAtsScore(extractedSkills, matchedSkills, missingSkills, requiredSkillsList, estimatedExperienceYears, job);

  return {
    fileName: fileName || 'uploaded_resume.txt',
    extractedText: safeText,
    estimatedExperienceYears,
    extractedEducation,
    extractedSkills,
    matchedSkills,
    missingSkills,
    atsMatchScore
  };
}

module.exports = {
  extractTextFromFile,
  estimateExperienceYears,
  analyzeResume
};
