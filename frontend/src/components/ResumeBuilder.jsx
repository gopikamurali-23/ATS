import React, { useState } from 'react';
import { 
  FileText, Plus, Trash2, Edit2, Download, Eye, Layers, Check, MoveUp, 
  MoveDown, Sparkles, User, Briefcase, GraduationCap, Award, Globe, Code, FileCheck, ArrowLeft
} from 'lucide-react';

export const ResumeBuilder = ({ onBack }) => {
  const [template, setTemplate] = useState('modern'); // 'modern', 'corporate', 'minimal'
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Resume Data State
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: 'John Doe',
      title: 'Senior Full Stack Software Engineer',
      email: 'john.doe@example.com',
      phone: '+1 (555) 019-2831',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe'
    },
    summary: 'Versatile Senior Full Stack Software Engineer with 6+ years of experience designing scalable enterprise web services using Java Spring Boot, React, TypeScript, and AWS cloud infrastructure.',
    education: [
      {
        id: 1,
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        year: '2016 - 2020'
      }
    ],
    experience: [
      {
        id: 1,
        role: 'Senior Backend Engineer',
        company: 'TechCorp Enterprise Solutions',
        location: 'San Francisco, CA',
        period: '2022 - Present',
        description: 'Architected microservices using Java 17 and Spring Boot. Reduced API latency by 35% through Redis caching and PostgreSQL query optimization.'
      },
      {
        id: 2,
        role: 'Full Stack Developer',
        company: 'Innovate Labs',
        location: 'Oakland, CA',
        period: '2020 - 2022',
        description: 'Developed responsive dashboard applications using React, TypeScript, and Redux. Integrated RESTful APIs with Node.js services.'
      }
    ],
    skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'REST API', 'Git', 'CI/CD'],
    projects: [
      {
        id: 1,
        title: 'TalentPulse Resume Engine',
        tech: 'React, Node.js, Tailwind CSS',
        description: 'Automated ATS match parser calculating keyword similarity scores against job descriptions.'
      }
    ],
    certifications: [
      { id: 1, name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' }
    ],
    achievements: ['Published paper on Distributed Microservices (2023)', 'Winner of TechCorp Hackathon (2022)'],
    languages: ['English (Native)', 'Spanish (Professional)'],
    additionalInfo: 'Willing to relocate. Passionate open-source contributor.'
  });

  // Edit State
  const [newSkill, setNewSkill] = useState('');
  const [newAchieve, setNewAchieve] = useState('');

  // Experience modal/inline form
  const [expRole, setExpRole] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expPeriod, setExpPeriod] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Education form
  const [eduDegree, setEduDegree] = useState('');
  const [eduInst, setEduInst] = useState('');
  const [eduYear, setEduYear] = useState('');

  // Project form
  const [projTitle, setProjTitle] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projDesc, setProjDesc] = useState('');

  // ADD HANDLERS
  const handleAddSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({ ...resumeData, skills: [...resumeData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleAddExperience = () => {
    if (expRole && expCompany) {
      const newItem = {
        id: Date.now(),
        role: expRole,
        company: expCompany,
        period: expPeriod || '2023 - Present',
        description: expDesc
      };
      setResumeData({ ...resumeData, experience: [...resumeData.experience, newItem] });
      setExpRole(''); setExpCompany(''); setExpPeriod(''); setExpDesc('');
    }
  };

  const handleRemoveExperience = (id) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(e => e.id !== id)
    });
  };

  const handleAddEducation = () => {
    if (eduDegree && eduInst) {
      const newItem = {
        id: Date.now(),
        degree: eduDegree,
        institution: eduInst,
        year: eduYear || '2020'
      };
      setResumeData({ ...resumeData, education: [...resumeData.education, newItem] });
      setEduDegree(''); setEduInst(''); setEduYear('');
    }
  };

  const handleRemoveEducation = (id) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(e => e.id !== id)
    });
  };

  const handleAddProject = () => {
    if (projTitle) {
      const newItem = {
        id: Date.now(),
        title: projTitle,
        tech: projTech,
        description: projDesc
      };
      setResumeData({ ...resumeData, projects: [...resumeData.projects, newItem] });
      setProjTitle(''); setProjTech(''); setProjDesc('');
    }
  };

  const handleRemoveProject = (id) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter(p => p.id !== id)
    });
  };

  const handleDownload = () => {
    const textContent = `
==================================================
${resumeData.personalInfo.fullName.toUpperCase()}
${resumeData.personalInfo.title}
Email: ${resumeData.personalInfo.email} | Phone: ${resumeData.personalInfo.phone}
Location: ${resumeData.personalInfo.location} | LinkedIn: ${resumeData.personalInfo.linkedin}
==================================================

PROFESSIONAL SUMMARY
--------------------------------------------------
${resumeData.summary}

WORK EXPERIENCE
--------------------------------------------------
${resumeData.experience.map(e => `${e.role} @ ${e.company} (${e.period})\n${e.description}`).join('\n\n')}

EDUCATION
--------------------------------------------------
${resumeData.education.map(e => `${e.degree} - ${e.institution} (${e.year})`).join('\n')}

TECHNICAL SKILLS
--------------------------------------------------
${resumeData.skills.join(', ')}

PROJECTS
--------------------------------------------------
${resumeData.projects.map(p => `${p.title} [${p.tech}]\n${p.description}`).join('\n\n')}

CERTIFICATIONS
--------------------------------------------------
${resumeData.certifications.map(c => `${c.name} - ${c.issuer} (${c.year})`).join('\n')}

LANGUAGES: ${resumeData.languages.join(', ')}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.txt`;
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar with Back button option */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 edge-glow-hover">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="pill-btn p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Interactive Resume Builder
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Create an ATS-formatted resume. Download as TXT/PDF or sync directly to your TalentPulse profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-medium">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1 rounded-full transition-all ${template === 'modern' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-slate-600 dark:text-zinc-400'}`}
            >
              Modern
            </button>
            <button
              onClick={() => setTemplate('corporate')}
              className={`px-3 py-1 rounded-full transition-all ${template === 'corporate' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm' : 'text-slate-600 dark:text-zinc-400'}`}
            >
              Corporate
            </button>
          </div>

          <button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="pill-btn px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> {isPreviewOpen ? 'Edit Sections' : 'Preview Resume'}
          </button>

          <button
            onClick={handleDownload}
            className="pill-btn px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download Resume
          </button>
        </div>
      </div>

      {isPreviewOpen ? (
        /* LIVE RESUME PREVIEW PANEL */
        <div className="bg-white border-2 border-slate-300 rounded-xl p-8 shadow-md max-w-3xl mx-auto space-y-6 font-sans">
          
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{resumeData.personalInfo.fullName}</h1>
            <p className="text-sm font-semibold text-blue-600">{resumeData.personalInfo.title}</p>
            <div className="text-xs text-slate-500 flex flex-wrap justify-center gap-3 pt-1">
              <span>{resumeData.personalInfo.email}</span> •
              <span>{resumeData.personalInfo.phone}</span> •
              <span>{resumeData.personalInfo.location}</span> •
              <span>{resumeData.personalInfo.linkedin}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              Professional Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{resumeData.summary}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              Work Experience
            </h3>
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-slate-900">{exp.role} — <span className="text-slate-700">{exp.company}</span></span>
                  <span className="text-slate-500 font-semibold">{exp.period}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              Education
            </h3>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <div className="font-bold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600">{edu.institution}</div>
                </div>
                <span className="text-slate-500 font-semibold">{edu.year}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {resumeData.skills.map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {resumeData.projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                Key Projects
              </h3>
              {resumeData.projects.map((proj) => (
                <div key={proj.id} className="space-y-0.5 text-xs">
                  <div className="font-bold text-slate-900">{proj.title} <span className="font-normal text-slate-500">({proj.tech})</span></div>
                  <p className="text-slate-600">{proj.description}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        /* SECTION EDITORS GRID */
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Column 1: Personal Info & Summary */}
          <div className="space-y-6">
            
            {/* Section 1: Personal Information */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 1. Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, fullName: e.target.value } })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.title}
                    onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, title: e.target.value } })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Email</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, email: e.target.value } })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, phone: e.target.value } })}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Summary */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 2. Professional Summary
              </h3>
              <textarea
                rows={4}
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Section 3: Technical Skills */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 3. Skills
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  placeholder="Add skill (e.g. React, Spring Boot)"
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {resumeData.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2: Work Experience & Education */}
          <div className="space-y-6">
            
            {/* Section 4: Work Experience */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 4. Work Experience
              </h3>

              <div className="space-y-2">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl space-y-1 relative">
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{exp.role} @ {exp.company}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">{exp.period}</div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300">{exp.description}</p>
                  </div>
                ))}
              </div>

              {/* Add New Experience Form */}
              <div className="p-3 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl space-y-2 text-xs bg-slate-50/50 dark:bg-zinc-800/30">
                <div className="font-bold text-slate-700 dark:text-zinc-300">Add New Work Experience</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Role Title"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Period (e.g. 2021 - 2024)"
                  value={expPeriod}
                  onChange={(e) => setExpPeriod(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md"
                />
                <textarea
                  rows={2}
                  placeholder="Key responsibilities and achievements..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md"
                />
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs rounded-md"
                >
                  Add Experience Item
                </button>
              </div>
            </div>

            {/* Section 5: Education */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 5. Education
              </h3>

              <div className="space-y-2">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl flex justify-between items-start">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{edu.degree}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">{edu.institution} ({edu.year})</div>
                    </div>
                    <button onClick={() => handleRemoveEducation(edu.id)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl space-y-2 text-xs bg-slate-50/50 dark:bg-zinc-800/30">
                <div className="font-bold text-slate-700 dark:text-zinc-300">Add Education</div>
                <input
                  type="text"
                  placeholder="Degree (e.g. B.S. Computer Science)"
                  value={eduDegree}
                  onChange={(e) => setEduDegree(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Institution"
                    value={eduInst}
                    onChange={(e) => setEduInst(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Year (e.g. 2020)"
                    value={eduYear}
                    onChange={(e) => setEduYear(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs rounded-md"
                >
                  Add Education Item
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
