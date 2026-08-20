import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const SKILL_DICTIONARY = [
  "Java", "Python", "C++", "C#", "JavaScript", "TypeScript", "HTML", "CSS", "SQL",
  "PostgreSQL", "MySQL", "MongoDB", "Spring Boot", "Spring", "React", "Angular", "Vue",
  "Node.js", "Express", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub",
  "CI/CD", "Jenkins", "Agile", "Scrum", "REST API", "GraphQL", "Microservices", "Hibernate",
  "JPA", "Redux", "Tailwind", "Bootstrap", "Linux", "Unix", "Go", "Golang",
  "Project Management", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "AI"
];

// Helper to escape regex special characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractTextFromPdf = async (buffer) => {
  const data = await pdf(buffer);
  return data.text || '';
};

const extractTextFromDocx = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
};

export const extractText = async (file) => {
  const filename = file.originalname;
  if (!filename) {
    throw new Error('Invalid file name');
  }

  if (filename.toLowerCase().endsWith('.pdf')) {
    return await extractTextFromPdf(file.buffer);
  } else if (filename.toLowerCase().endsWith('.docx')) {
    return await extractTextFromDocx(file.buffer);
  } else {
    throw new Error('Unsupported file format. Only PDF and DOCX are supported.');
  }
};

export const extractSkills = (text) => {
  const matchedSkills = [];
  const lowerText = text.toLowerCase();

  for (const skill of SKILL_DICTIONARY) {
    let patternString;
    if (skill === 'C++' || skill === 'C#') {
      patternString = escapeRegExp(skill.toLowerCase());
    } else {
      patternString = '\\b' + escapeRegExp(skill.toLowerCase()) + '\\b';
    }

    const regex = new RegExp(patternString, 'i');
    if (regex.test(lowerText)) {
      matchedSkills.add ? matchedSkills.push(skill) : matchedSkills.push(skill);
    }
  }
  return matchedSkills;
};

export const extractEducation = (text) => {
  const educationEntries = [];
  const lines = text.split('\n');

  const eduPattern = /(bachelor|master|phd|doctorate|b\.s|m\.s|btech|mtech|degree|university|college|institute|education|diploma)/i;

  for (let line of lines) {
    line = line.trim();
    if (line.length > 5 && eduPattern.test(line)) {
      educationEntries.push(line);
      if (educationEntries.length >= 5) break;
    }
  }
  return educationEntries;
};

export const extractExperience = (text) => {
  const experienceEntries = [];
  const lines = text.split('\n');

  const expPattern = /(developer|engineer|manager|lead|architect|analyst|intern|experience|work|employment|specialist|officer)/i;

  for (let line of lines) {
    line = line.trim();
    if (line.length > 5 && expPattern.test(line)) {
      experienceEntries.push(line);
      if (experienceEntries.length >= 8) break;
    }
  }
  return experienceEntries;
};

export const estimateYearsOfExperience = (text) => {
  let years = 0;
  
  // 1. Check explicit "X years of experience" statements
  const pattern = /(\d+)\+?\s*(year|yr)s?\s+of\s+experience/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val)) {
      years = Math.max(years, val);
    }
  }

  // 2. Add up date ranges (e.g. 2018 - 2022)
  const datePattern = /(\b20\d{2}\b)\s*[-–—]\s*(\b20\d{2}\b|present)/gi;
  let totalRangeYears = 0;
  const currentYear = new Date().getFullYear();
  
  while ((match = datePattern.exec(text)) !== null) {
    const start = parseInt(match[1], 10);
    const endStr = match[2].toLowerCase();
    const end = endStr === 'present' ? currentYear : parseInt(endStr, 10);
    
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalRangeYears += (end - start);
    }
  }

  return Math.max(years, totalRangeYears);
};
