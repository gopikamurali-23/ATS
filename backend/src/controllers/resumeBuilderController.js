import prisma from '../config/db.js';
import PDFDocument from 'pdfkit';

// AI Professional Summary Generator
export const generateSummary = async (req, res, next) => {
  try {
    const { name, title, skills, experience, education } = req.body;

    const skillList = Array.isArray(skills) ? skills : (skills ? skills.split(',') : []);
    const expCount = Array.isArray(experience) ? experience.length : 0;
    
    // Generate context-aware professional summaries (simulate LLM)
    const options = [
      `Results-driven ${title || 'Professional'} with ${expCount > 0 ? expCount + '+' : 'several'} years of hands-on experience in the industry. Expertise in ${skillList.slice(0, 3).join(', ') || 'software development'}. Proven record of delivering high-quality deliverables and collaborating with cross-functional teams to achieve project objectives.`,
      `Detail-oriented and highly motivated ${title || 'Developer'} skilled in ${skillList.slice(0, 4).join(', ') || 'modern engineering methodologies'}. Adept at designing, building, and deploying scalable solutions. Passionate about solving complex problems and optimizing system efficiencies.`,
      `Strategic ${title || 'Specialist'} offering a strong technical background in ${skillList.slice(0, 3).join(', ') || 'advanced technologies'}. Experienced in full lifecycle development, performance optimization, and implementing secure, resilient frameworks. Strong communication and collaborative skills.`
    ];

    return res.status(200).json({ summaries: options });
  } catch (error) {
    next(error);
  }
};

// AI Re-write Experience Points
export const rewriteExperience = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Experience point text is required.' });
    }

    // List of dynamic professional rewrites incorporating active verbs (simulate LLM)
    const rewrites = [
      `Spearheaded the development and deployment of core components, resulting in improved system efficiency and a 15% reduction in latency.`,
      `Collaborated with cross-functional teams to engineer scalable software architecture, enhancing feature velocity and code stability.`,
      `Optimized data access layers and database indexes, boosting database query performance by 25% across production environments.`,
      `Designed and implemented secure REST API interfaces using modern industry standards, ensuring seamless third-party integrations.`
    ];

    // Attempt to synthesize based on user inputs
    let cleanText = text.trim();
    if (cleanText.toLowerCase().includes('work') || cleanText.toLowerCase().includes('write')) {
      rewrites.unshift(`Engineered and maintained critical workflow services, driving code modularity and reliability.`);
    }

    return res.status(200).json({ rewrites });
  } catch (error) {
    next(error);
  }
};

// AI Generate ATS-Friendly Skills Section
export const generateSkills = async (req, res, next) => {
  try {
    const { role } = req.body;
    const cleanRole = (role || 'Software Engineer').toLowerCase();

    let skills = ['JavaScript', 'TypeScript', 'Node.js', 'Express', 'SQL', 'Git', 'REST APIs', 'Agile'];
    if (cleanRole.includes('java') || cleanRole.includes('backend')) {
      skills = ['Java', 'Spring Boot', 'Hibernate', 'REST APIs', 'PostgreSQL', 'Docker', 'Microservices', 'CI/CD', 'Git', 'AWS'];
    } else if (cleanRole.includes('front') || cleanRole.includes('react')) {
      skills = ['React.js', 'Redux Toolkit', 'HTML5', 'CSS3', 'Tailwind CSS', 'JavaScript (ES6+)', 'TypeScript', 'Vite', 'REST APIs', 'Git'];
    } else if (cleanRole.includes('python') || cleanRole.includes('data')) {
      skills = ['Python', 'Django', 'Flask', 'Pandas', 'NumPy', 'SQL', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'Machine Learning'];
    }

    return res.status(200).json({ skills });
  } catch (error) {
    next(error);
  }
};

// AI Grammar & Vocabulary Improver
export const improveGrammar = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Text is required for grammar improvement.' });
    }

    // Capitalize, fix basic punctuation, rephrase weak words (simulate LLM)
    let improved = text.trim();
    
    // Simple mock grammar fixes
    improved = improved.replace(/\bi did\b/gi, 'Successfully delivered');
    improved = improved.replace(/\bi made\b/gi, 'Architected and built');
    improved = improved.replace(/\bi was responsible for\b/gi, 'Managed and spearheaded');
    improved = improved.replace(/\bi worked on\b/gi, 'Contributed to the engineering of');
    improved = improved.replace(/\bi helped\b/gi, 'Collaborated with team members to enhance');
    
    // Capitalize first letter
    improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    if (!improved.endsWith('.')) {
      improved += '.';
    }

    return res.status(200).json({ improvedText: improved });
  } catch (error) {
    next(error);
  }
};

// AI Suggest Missing Skills
export const suggestSkills = async (req, res, next) => {
  try {
    const { role, currentSkills } = req.body;
    const cleanRole = (role || 'Software Engineer').toLowerCase();
    const activeSkills = (currentSkills || []).map(s => s.toLowerCase());

    const techStack = {
      java: ['Spring Boot', 'Docker', 'Kubernetes', 'PostgreSQL', 'Microservices', 'CI/CD', 'AWS', 'JUnit'],
      react: ['Redux', 'Tailwind CSS', 'TypeScript', 'Vite', 'HTML5/CSS3', 'Jest', 'REST APIs'],
      python: ['Django', 'FastAPI', 'PostgreSQL', 'Pandas', 'NumPy', 'Docker', 'AWS', 'PyTest'],
      devops: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'AWS', 'Bash scripting', 'Linux']
    };

    let targetStack = techStack.java; // default
    if (cleanRole.includes('front') || cleanRole.includes('react')) targetStack = techStack.react;
    else if (cleanRole.includes('python') || cleanRole.includes('data')) targetStack = techStack.python;
    else if (cleanRole.includes('devops') || cleanRole.includes('cloud')) targetStack = techStack.devops;

    const suggested = targetStack.filter(skill => !activeSkills.includes(skill.toLowerCase()));

    return res.status(200).json({ suggestedSkills: suggested });
  } catch (error) {
    next(error);
  }
};

// AI Suggest Better Keywords
export const suggestKeywords = async (req, res, next) => {
  try {
    const { role } = req.body;
    const cleanRole = (role || 'Software Engineer').toLowerCase();

    let keywords = ['RESTful web services', 'Relational database management', 'Object-oriented programming (OOP)', 'Scalability', 'Microservice architecture', 'Continuous integration', 'Agile scrum methodology'];
    if (cleanRole.includes('front') || cleanRole.includes('react')) {
      keywords = ['Single Page Applications (SPA)', 'Component lifecycle management', 'Responsive design UI/UX', 'State management models', 'Cross-browser compatibility', 'Frontend optimization'];
    }

    return res.status(200).json({ keywords });
  } catch (error) {
    next(error);
  }
};

// Save a version of built resume
export const saveResume = async (req, res, next) => {
  try {
    const {
      id,
      name,
      email,
      phone,
      linkedin,
      github,
      portfolio,
      summary,
      education,
      experience,
      skills,
      projects,
      certifications,
      template
    } = req.body;

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    let saved;

    if (id) {
      // Fetch existing
      const existing = await prisma.builder_resumes.findUnique({
        where: { id: BigInt(id) }
      });

      if (!existing) {
        return res.status(404).json({ message: 'Resume draft not found' });
      }

      // Update in place (increment version)
      saved = await prisma.builder_resumes.update({
        where: { id: BigInt(id) },
        data: {
          version: existing.version + 1,
          name,
          email,
          phone,
          linkedin,
          github,
          portfolio,
          summary,
          education: typeof education === 'string' ? education : JSON.stringify(education),
          experience: typeof experience === 'string' ? experience : JSON.stringify(experience),
          skills: typeof skills === 'string' ? skills : JSON.stringify(skills),
          projects: typeof projects === 'string' ? projects : JSON.stringify(projects),
          certifications: typeof certifications === 'string' ? certifications : JSON.stringify(certifications),
          template: template || 'Modern',
          updated_at: new Date()
        }
      });
    } else {
      // Create new draft
      saved = await prisma.builder_resumes.create({
        data: {
          candidate_id: candidate.id,
          version: 1,
          name,
          email,
          phone,
          linkedin,
          github,
          portfolio,
          summary,
          education: typeof education === 'string' ? education : JSON.stringify(education),
          experience: typeof experience === 'string' ? experience : JSON.stringify(experience),
          skills: typeof skills === 'string' ? skills : JSON.stringify(skills),
          projects: typeof projects === 'string' ? projects : JSON.stringify(projects),
          certifications: typeof certifications === 'string' ? certifications : JSON.stringify(certifications),
          template: template || 'Modern',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    return res.status(200).json(saved);
  } catch (error) {
    next(error);
  }
};

// List resume versions for applicant
export const listVersions = async (req, res, next) => {
  try {
    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    const versions = await prisma.builder_resumes.findMany({
      where: { candidate_id: candidate.id },
      orderBy: { updated_at: 'desc' }
    });

    return res.status(200).json(versions);
  } catch (error) {
    next(error);
  }
};

// Load specific resume version
export const getVersion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resume = await prisma.builder_resumes.findUnique({
      where: { id: BigInt(id) }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume version not found' });
    }

    return res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};

// Export to text / doc / pdf download
export const exportResume = async (req, res, next) => {
  try {
    const { id, format } = req.params;

    const resume = await prisma.builder_resumes.findUnique({
      where: { id: BigInt(id) }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume version not found' });
    }

    // Convert saved fields to strings if parsed
    let eduList = [];
    try {
      eduList = resume.education ? JSON.parse(resume.education) : [];
    } catch (e) {
      eduList = typeof resume.education === 'string' ? [{ degree: resume.education, school: '', year: '' }] : [];
    }

    let expList = [];
    try {
      expList = resume.experience ? JSON.parse(resume.experience) : [];
    } catch (e) {
      expList = typeof resume.experience === 'string' ? [{ company: '', role: '', duration: '', description: resume.experience }] : [];
    }

    let skillList = [];
    try {
      skillList = resume.skills ? JSON.parse(resume.skills) : [];
    } catch (e) {
      skillList = typeof resume.skills === 'string' ? resume.skills.split(',').map(s => s.trim()) : [];
    }

    let projList = [];
    try {
      projList = resume.projects ? JSON.parse(resume.projects) : [];
    } catch (e) {
      projList = typeof resume.projects === 'string' ? [{ title: resume.projects, description: '' }] : [];
    }

    let certList = [];
    try {
      certList = resume.certifications ? JSON.parse(resume.certifications) : [];
    } catch (e) {
      certList = typeof resume.certifications === 'string' ? [{ title: resume.certifications, issuer: '', year: '' }] : [];
    }

    // Clean lists of empty items
    eduList = eduList.filter(edu => edu && (edu.degree || edu.school || edu.year));
    expList = expList.filter(exp => exp && (exp.role || exp.company || exp.duration || exp.description));
    skillList = skillList.filter(s => s && s.trim() !== '');
    projList = projList.filter(p => p && (p.title || p.description));
    certList = certList.filter(c => c && (c.title || c.issuer || c.year));

    // Draft a structured markdown/text format representation for DOCX
    let docContent = '';
    docContent += `==========================================\n`;
    docContent += `${resume.name.toUpperCase()}\n`;
    docContent += `Email: ${resume.email} | Phone: ${resume.phone || ''}\n`;
    docContent += `LinkedIn: ${resume.linkedin || ''} | GitHub: ${resume.github || ''}\n`;
    if (resume.portfolio) docContent += `Portfolio: ${resume.portfolio}\n`;
    docContent += `==========================================\n\n`;

    if (resume.summary) {
      docContent += `PROFESSIONAL SUMMARY\n`;
      docContent += `--------------------\n`;
      docContent += `${resume.summary}\n\n`;
    }

    if (skillList.length > 0) {
      docContent += `TECHNICAL SKILLS\n`;
      docContent += `----------------\n`;
      docContent += `${skillList.join(', ')}\n\n`;
    }

    if (expList.length > 0) {
      docContent += `PROFESSIONAL EXPERIENCE\n`;
      docContent += `-----------------------\n`;
      expList.forEach(exp => {
        docContent += `${exp.role} | ${exp.company} | ${exp.duration || ''}\n`;
        docContent += `${exp.description || ''}\n\n`;
      });
    }

    if (eduList.length > 0) {
      docContent += `EDUCATION\n`;
      docContent += `---------\n`;
      eduList.forEach(edu => {
        docContent += `${edu.degree} | ${edu.school} | Graduated: ${edu.year || ''}\n\n`;
      });
    }

    if (projList.length > 0) {
      docContent += `PROJECTS\n`;
      docContent += `--------\n`;
      projList.forEach(proj => {
        docContent += `${proj.title}\n`;
        docContent += `${proj.description || ''}\n\n`;
      });
    }

    if (certList.length > 0) {
      docContent += `CERTIFICATIONS\n`;
      docContent += `--------------\n`;
      certList.forEach(cert => {
        docContent += `${cert.title} (${cert.year || ''}) - ${cert.issuer || ''}\n`;
      });
      docContent += `\n`;
    }

    // Set headers for download
    const filename = `${resume.name.replace(/\s+/g, '_')}_Resume_v${resume.version}`;
    
    if (format === 'pdf') {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 45, left: 45, right: 45 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        return res.send(pdfData);
      });

      // Style configurations based on selected template
      const isModern = resume.template === 'Modern';
      const isExecutive = resume.template === 'Executive';
      const isAts = resume.template === 'ATS Friendly';

      const primaryColor = isModern ? '#4f46e5' : (isExecutive ? '#1e293b' : (isAts ? '#000000' : '#1e3a8a'));
      const textColor = isAts ? '#000000' : '#334155';
      const titleColor = isAts ? '#000000' : '#0f172a';
      const fontName = isExecutive ? 'Times-Roman' : 'Helvetica';
      const fontBold = isExecutive ? 'Times-Bold' : 'Helvetica-Bold';
      const fontOblique = isExecutive ? 'Times-Italic' : 'Helvetica-Oblique';

      // 1. Header Section
      if (resume.name) {
        doc.font(fontBold).fontSize(isExecutive ? 24 : 22).fillColor(primaryColor).text(resume.name.toUpperCase(), { align: 'center' });
        doc.moveDown(0.2);
      }

      // Contact Details Subline
      const contactInfo = [];
      if (resume.email) contactInfo.push(resume.email);
      if (resume.phone) contactInfo.push(resume.phone);
      if (resume.linkedin) contactInfo.push(resume.linkedin);
      if (resume.github) contactInfo.push(resume.github);
      if (resume.portfolio) contactInfo.push(resume.portfolio);

      if (contactInfo.length > 0) {
        doc.font(fontName).fontSize(9).fillColor(isAts ? '#000000' : '#64748b').text(contactInfo.join('   |   '), { align: 'center' });
        doc.moveDown(0.4);
      }

      // Border line under header
      doc.strokeColor(isAts ? '#000000' : '#cbd5e1').lineWidth(isAts ? 1.5 : 1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.8);

      // Section Header drawer helper
      const drawSectionHeader = (title) => {
        doc.moveDown(0.6);
        doc.font(fontBold).fontSize(11).fillColor(primaryColor).text(title.toUpperCase());
        doc.moveDown(0.2);
        // Draw dividing line
        doc.strokeColor(isAts ? '#000000' : '#e2e8f0').lineWidth(0.8).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.4);
      };

      // Summary
      if (resume.summary && resume.summary.trim() !== '') {
        drawSectionHeader('Professional Summary');
        doc.font(fontName).fontSize(9.5).fillColor(textColor).text(resume.summary, { align: 'justify', lineGap: 2.5 });
      }

      // Technical Skills
      if (skillList && skillList.length > 0) {
        drawSectionHeader('Technical Skills');
        doc.font(fontName).fontSize(9.5).fillColor(textColor).text(skillList.join(', '), { align: 'left', lineGap: 2.5 });
      }

      // Experience
      if (expList && expList.length > 0) {
        drawSectionHeader('Professional Experience');
        expList.forEach((exp) => {
          if (!exp.role && !exp.company) return;
          const startY = doc.y;
          
          doc.font(fontBold).fontSize(10).fillColor(titleColor).text(`${exp.role || ''} — ${exp.company || ''}`, 45, startY, { width: 370 });
          
          if (exp.duration) {
            doc.font(fontOblique).fontSize(9).fillColor(isAts ? '#000000' : '#64748b').text(exp.duration, 420, startY, { align: 'right', width: 130 });
          }

          doc.x = 45; // Reset x positioning
          doc.moveDown(0.25);
          
          if (exp.description && exp.description.trim() !== '') {
            doc.font(fontName).fontSize(9).fillColor(textColor).text(exp.description, { align: 'justify', lineGap: 2 });
          }
          doc.moveDown(0.4);
        });
      }

      // Education
      if (eduList && eduList.length > 0) {
        drawSectionHeader('Education');
        eduList.forEach((edu) => {
          if (!edu.degree && !edu.school) return;
          const startY = doc.y;
          
          doc.font(fontBold).fontSize(10).fillColor(titleColor).text(edu.degree || '', 45, startY, { width: 370 });
          
          if (edu.year) {
            doc.font(fontOblique).fontSize(9).fillColor(isAts ? '#000000' : '#64748b').text(`Graduated: ${edu.year}`, 420, startY, { align: 'right', width: 130 });
          }

          doc.x = 45;
          doc.moveDown(0.2);
          if (edu.school) {
            doc.font(fontName).fontSize(9).fillColor(textColor).text(edu.school);
          }
          doc.moveDown(0.4);
        });
      }

      // Projects
      if (projList && projList.length > 0) {
        drawSectionHeader('Key Projects');
        projList.forEach((proj) => {
          if (!proj.title) return;
          doc.font(fontBold).fontSize(10).fillColor(titleColor).text(proj.title);
          doc.moveDown(0.2);
          
          if (proj.description && proj.description.trim() !== '') {
            doc.font(fontName).fontSize(9).fillColor(textColor).text(proj.description, { align: 'justify', lineGap: 2 });
          }
          doc.moveDown(0.4);
        });
      }

      // Certifications
      if (certList && certList.length > 0) {
        drawSectionHeader('Certifications');
        certList.forEach((cert) => {
          if (!cert.title) return;
          doc.font(fontName).fontSize(9.5).fillColor(textColor)
             .text(`•  ${cert.title}${cert.issuer ? ' — ' + cert.issuer : ''}${cert.year ? ' (' + cert.year + ')' : ''}`);
          doc.moveDown(0.25);
        });
      }

      doc.end();
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.docx`);
      // DOCX is simulated as a text-Word format here
      return res.send(Buffer.from(docContent));
    }
  } catch (error) {
    next(error);
  }
};
