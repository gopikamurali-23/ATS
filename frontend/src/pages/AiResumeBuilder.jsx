import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { 
  Sparkles, Plus, Trash, Download, Award, Briefcase, 
  GraduationCap, User, FileText, Check, ChevronRight, 
  ChevronLeft, Loader, RefreshCw, AlertCircle, Wand2, 
  BookOpen, Terminal, CheckCircle2, Star, Target, Eye, Upload
} from 'lucide-react';

const RESUME_TEMPLATES = [
  { id: 'Modern', name: 'Modern Elegant', desc: 'Vibrant sidebar layout with HSL accents' },
  { id: 'Professional', name: 'Professional Clean', desc: 'Classic top-centered layout with clean typography' },
  { id: 'ATS Friendly', name: 'ATS Optimized', desc: 'High-compliance single column layout' },
  { id: 'Executive', name: 'Executive Premium', desc: 'Elegant margins and rich serif header look' }
];

const TARGET_ROLES = [
  { id: 'Software Engineer', name: 'Software Engineer (General)' },
  { id: 'React Developer', name: 'Frontend Engineer (React)' },
  { id: 'Java Developer', name: 'Backend Engineer (Java/Spring Boot)' },
  { id: 'Python Developer', name: 'Data & Python Developer' }
];

const AiResumeBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [savedVersions, setSavedVersions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('Modern');
  const [targetRoleForAts, setTargetRoleForAts] = useState('Software Engineer');
  const [showAtsPreview, setShowAtsPreview] = useState(false);
  const [atsScoreDetails, setAtsScoreDetails] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Flow and parsing states
  const [flowStage, setFlowStage] = useState('GENERATE'); // 'GENERATE', 'PREVIEW', 'DOWNLOAD', 'UPLOAD', 'ANALYZE', 'SCORE'
  const [pdfLoading, setPdfLoading] = useState(false);
  const [atsFile, setAtsFile] = useState(null);
  const [atsUploadError, setAtsUploadError] = useState('');
  const [atsUploading, setAtsUploading] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStepText, setAnalyzeStepText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  
  // AI specific states
  const [aiLoading, setAiLoading] = useState({
    summary: false,
    rewrite: null, // index of experience entry
    skills: false,
    grammar: null, // 'summary' or exp index
    suggestedSkills: false,
    keywords: false
  });
  
  const [generatedSummaries, setGeneratedSummaries] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);

  // Wizard Form State
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: ''
  });

  const [education, setEducation] = useState([
    { degree: '', school: '', year: '' }
  ]);

  const [experience, setExperience] = useState([
    { company: '', role: '', duration: '', description: '' }
  ]);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const [projects, setProjects] = useState([
    { title: '', description: '' }
  ]);

  const [certifications, setCertifications] = useState([
    { title: '', issuer: '', year: '' }
  ]);

  // Load drafts and user profile details on mount
  useEffect(() => {
    if (location.state?.targetRole) {
      setTargetRoleForAts(location.state.targetRole);
    }
  }, [location.state]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Fetch candidate profile to prefill personal info
        const profileRes = await api.get('/api/applications/profile/candidate');
        if (profileRes.data) {
          setPersonalInfo(prev => ({
            ...prev,
            name: `${profileRes.data.first_name} ${profileRes.data.last_name}`.trim(),
            phone: profileRes.data.phone || '',
            email: profileRes.data.users?.email || prev.email
          }));
        }

        // Fetch drafts
        const versionsRes = await api.get('/api/resumes/builder/versions');
        setSavedVersions(versionsRes.data || []);
        if (versionsRes.data && versionsRes.data.length > 0) {
          loadResumeVersion(versionsRes.data[0]);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const loadResumeVersion = (versionData) => {
    setDraftId(versionData.id);
    setSelectedTemplate(versionData.template || 'Modern');
    setPersonalInfo({
      name: versionData.name || '',
      email: versionData.email || '',
      phone: versionData.phone || '',
      linkedin: versionData.linkedin || '',
      github: versionData.github || '',
      portfolio: versionData.portfolio || '',
      summary: versionData.summary || ''
    });

    try {
      setEducation(versionData.education ? JSON.parse(versionData.education) : [{ degree: '', school: '', year: '' }]);
    } catch { setEducation([{ degree: '', school: '', year: '' }]); }

    try {
      setExperience(versionData.experience ? JSON.parse(versionData.experience) : [{ company: '', role: '', duration: '', description: '' }]);
    } catch { setExperience([{ company: '', role: '', duration: '', description: '' }]); }

    try {
      setSkills(versionData.skills ? JSON.parse(versionData.skills) : []);
    } catch { setSkills([]); }

    try {
      setProjects(versionData.projects ? JSON.parse(versionData.projects) : [{ title: '', description: '' }]);
    } catch { setProjects([{ title: '', description: '' }]); }

    try {
      setCertifications(versionData.certifications ? JSON.parse(versionData.certifications) : [{ title: '', issuer: '', year: '' }]);
    } catch { setCertifications([{ title: '', issuer: '', year: '' }]); }

    showToast('success', `Loaded resume draft v${versionData.version}`);
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Generic array item managers
  const addEducation = () => setEducation([...education, { degree: '', school: '', year: '' }]);
  const removeEducation = (index) => setEducation(education.filter((_, idx) => idx !== index));
  const updateEducation = (index, field, val) => {
    const updated = [...education];
    updated[index][field] = val;
    setEducation(updated);
  };

  const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '', description: '' }]);
  const removeExperience = (index) => setExperience(experience.filter((_, idx) => idx !== index));
  const updateExperience = (index, field, val) => {
    const updated = [...experience];
    updated[index][field] = val;
    setExperience(updated);
  };

  const addProject = () => setProjects([...projects, { title: '', description: '' }]);
  const removeProject = (index) => setProjects(projects.filter((_, idx) => idx !== index));
  const updateProject = (index, field, val) => {
    const updated = [...projects];
    updated[index][field] = val;
    setProjects(updated);
  };

  const addCertification = () => setCertifications([...certifications, { title: '', issuer: '', year: '' }]);
  const removeCertification = (index) => setCertifications(certifications.filter((_, idx) => idx !== index));
  const updateCertification = (index, field, val) => {
    const updated = [...certifications];
    updated[index][field] = val;
    setCertifications(updated);
  };

  // Skill managers
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  // AI Integration Handlers
  const handleGenerateSummary = async () => {
    setAiLoading(prev => ({ ...prev, summary: true }));
    try {
      const res = await api.post('/api/resumes/builder/generate-summary', {
        title: personalInfo.summary ? personalInfo.summary.split(' ')[0] : 'Software Engineer',
        skills: skills,
        experience: experience,
        education: education
      });
      setGeneratedSummaries(res.data.summaries || []);
      showToast('success', 'Generated professional summary recommendations.');
    } catch (err) {
      showToast('error', 'Failed to generate summary.');
    } finally {
      setAiLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const handleRewriteExperience = async (index) => {
    const currentText = experience[index].description;
    if (!currentText || currentText.trim() === '') {
      showToast('error', 'Please write a simple bullet point or description first.');
      return;
    }
    setAiLoading(prev => ({ ...prev, rewrite: index }));
    try {
      const res = await api.post('/api/resumes/builder/rewrite-experience', { text: currentText });
      if (res.data.rewrites && res.data.rewrites.length > 0) {
        updateExperience(index, 'description', res.data.rewrites[0]);
        showToast('success', 'Rewrote experience with active metrics.');
      }
    } catch (err) {
      showToast('error', 'Failed to rewrite description.');
    } finally {
      setAiLoading(prev => ({ ...prev, rewrite: null }));
    }
  };

  const handleImproveGrammar = async (type, index = null) => {
    let text = '';
    if (type === 'summary') text = personalInfo.summary;
    else if (type === 'experience') text = experience[index].description;

    if (!text || text.trim() === '') {
      showToast('error', 'No text to improve.');
      return;
    }

    setAiLoading(prev => ({ ...prev, grammar: type === 'summary' ? 'summary' : index }));
    try {
      const res = await api.post('/api/resumes/builder/improve-grammar', { text });
      if (type === 'summary') {
        setPersonalInfo(prev => ({ ...prev, summary: res.data.improvedText }));
      } else {
        updateExperience(index, 'description', res.data.improvedText);
      }
      showToast('success', 'Polished grammar and vocabulary.');
    } catch (err) {
      showToast('error', 'Failed to polish text.');
    } finally {
      setAiLoading(prev => ({ ...prev, grammar: null }));
    }
  };

  const handleGenerateSkills = async () => {
    setAiLoading(prev => ({ ...prev, skills: true }));
    try {
      const res = await api.post('/api/resumes/builder/generate-skills', { role: targetRoleForAts });
      const newSkills = res.data.skills || [];
      const filtered = newSkills.filter(s => !skills.includes(s));
      setSkills([...skills, ...filtered]);
      showToast('success', `Imported ${filtered.length} target role skills.`);
    } catch (err) {
      showToast('error', 'Failed to fetch standard skills.');
    } finally {
      setAiLoading(prev => ({ ...prev, skills: false }));
    }
  };

  const handleSuggestSkills = async () => {
    setAiLoading(prev => ({ ...prev, suggestedSkills: true }));
    try {
      const res = await api.post('/api/resumes/builder/suggest-skills', {
        role: targetRoleForAts,
        currentSkills: skills
      });
      setSuggestedSkills(res.data.suggestedSkills || []);
    } catch (err) {
      showToast('error', 'Failed to generate missing skill suggestions.');
    } finally {
      setAiLoading(prev => ({ ...prev, suggestedSkills: false }));
    }
  };

  const handleSuggestKeywords = async () => {
    setAiLoading(prev => ({ ...prev, keywords: true }));
    try {
      const res = await api.post('/api/resumes/builder/suggest-keywords', { role: targetRoleForAts });
      setSuggestedKeywords(res.data.keywords || []);
    } catch (err) {
      showToast('error', 'Failed to fetch matching keywords.');
    } finally {
      setAiLoading(prev => ({ ...prev, keywords: false }));
    }
  };

  // Draft Save Handler
  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const payload = {
        id: draftId,
        name: personalInfo.name,
        email: personalInfo.email,
        phone: personalInfo.phone,
        linkedin: personalInfo.linkedin,
        github: personalInfo.github,
        portfolio: personalInfo.portfolio,
        summary: personalInfo.summary,
        education,
        experience,
        skills,
        projects,
        certifications,
        template: selectedTemplate
      };

      const res = await api.post('/api/resumes/builder/save', payload);
      setDraftId(res.data.id);
      
      // reload version lists
      const versionsRes = await api.get('/api/resumes/builder/versions');
      setSavedVersions(versionsRes.data || []);
      
      showToast('success', 'Draft saved successfully in database.');
      return res.data;
    } catch (err) {
      showToast('error', 'Failed to save resume draft.');
    } finally {
      setLoading(false);
    }
  };

  // Run ATS Analysis Preview
  const runAtsPreview = async () => {
    setAtsLoading(true);
    try {
      // First save current draft to ensure it is stored
      const currentDraft = await handleSaveDraft();
      
      // Simulate/Calculate detailed ATS metrics matching recruiter specifications
      // 1. Skill Score
      let requiredSkills = ['JavaScript', 'TypeScript', 'Node.js', 'React', 'SQL', 'Git'];
      if (targetRoleForAts.includes('Java')) requiredSkills = ['Java', 'Spring Boot', 'SQL', 'Git', 'Docker', 'AWS'];
      if (targetRoleForAts.includes('Python')) requiredSkills = ['Python', 'Django', 'SQL', 'Pandas', 'Docker', 'Machine Learning'];

      const matches = skills.filter(s => requiredSkills.some(r => r.toLowerCase() === s.toLowerCase()));
      const skillScore = Math.round((matches.length / requiredSkills.length) * 100);

      // 2. Experience Score
      const expYears = experience.length * 1.5;
      const experienceScore = Math.min(100, Math.round((expYears / 3.0) * 100));

      // 3. Education Score
      const hasBtech = education.some(e => /btech|b\.tech|bachelor|degree|computer|engineering/i.test(e.degree || '') || /btech|b\.tech|bachelor|degree|computer/i.test(e.school || ''));
      const educationScore = hasBtech ? 100 : 70;

      // 4. Project relevance
      const projScore = projects.length > 0 ? Math.min(100, 60 + projects.length * 15) : 40;

      // 5. Keyword Matches
      const matchedKeywords = [];
      const missingKeywords = [];
      const textBlock = `${personalInfo.summary} ${experience.map(e=>e.description).join(' ')} ${projects.map(p=>p.description).join(' ')}`.toLowerCase();
      
      const roleKeywords = ['Scalability', 'REST APIs', 'JWT Authorization', 'CI/CD automation', 'Microservices', 'Clean Code', 'Responsive UI'];
      roleKeywords.forEach(kw => {
        if (textBlock.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        } else {
          missingKeywords.push(kw);
        }
      });
      const keywordScore = Math.round((matchedKeywords.length / roleKeywords.length) * 100);

      const overall = Math.round((skillScore * 0.3) + (experienceScore * 0.25) + (educationScore * 0.15) + (projScore * 0.15) + (keywordScore * 0.15));

      setAtsScoreDetails({
        overallScore: overall,
        skillScore,
        experienceScore,
        educationScore,
        projectScore: projScore,
        keywordScore,
        matchedKeywords,
        missingKeywords,
        missingSkillsList: requiredSkills.filter(s => !skills.some(c => c.toLowerCase() === s.toLowerCase()))
      });
      setShowAtsPreview(true);
    } catch (err) {
      showToast('error', 'Error running ATS analysis.');
    } finally {
      setAtsLoading(false);
    }
  };

  // Export File Handler
  const handleExport = async (format) => {
    if (!draftId) {
      showToast('error', 'Please save draft or run ATS score first.');
      return;
    }

    if (!personalInfo.name || personalInfo.name.trim() === '') {
      showToast('error', 'Cannot download a blank resume. Please complete your name in Step 1.');
      return;
    }

    setPdfLoading(true);
    
    try {
      // Trigger browser download directly from API
      const token = localStorage.getItem('token');
      const downloadUrl = `/api/resumes/builder/${draftId}/export/${format}`;
      
      const response = await api.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${personalInfo.name.replace(/\s+/g, '_')}_Resume_v${savedVersions.find(v => v.id === draftId)?.version || 1}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('success', `Successfully downloaded ${format.toUpperCase()} Resume.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to generate PDF resume. Please ensure all required fields are filled.');
    } finally {
      setPdfLoading(false);
    }
  };

  const calculateAtsScore = (profile) => {
    let requiredSkills = ['JavaScript', 'TypeScript', 'Node.js', 'React', 'SQL', 'Git'];
    if (targetRoleForAts.includes('Java')) requiredSkills = ['Java', 'Spring Boot', 'SQL', 'Git', 'Docker', 'AWS'];
    if (targetRoleForAts.includes('Python')) requiredSkills = ['Python', 'Django', 'SQL', 'Pandas', 'Docker', 'Machine Learning'];

    const candSkills = profile.candidate_skills ? profile.candidate_skills.map(s => s.skill.toLowerCase()) : [];
    const matches = requiredSkills.filter(s => candSkills.includes(s.toLowerCase()));
    const skillScore = requiredSkills.length > 0 ? Math.round((matches.length / requiredSkills.length) * 100) : 0;

    const expCount = profile.candidate_experience ? profile.candidate_experience.length : 0;
    const expYears = expCount * 1.5;
    const experienceScore = Math.min(100, Math.round((expYears / 3.0) * 100));

    const eduEntries = profile.candidate_education ? profile.candidate_education.map(e => e.education_entry.toLowerCase()) : [];
    const hasBtech = eduEntries.some(e => /btech|b\.tech|bachelor|degree|computer|engineering|science|university|college/i.test(e));
    const educationScore = hasBtech ? 100 : 70;

    const projScore = projects.length > 0 ? Math.min(100, 60 + projects.length * 15) : 40;

    const matchedKeywords = [];
    const missingKeywords = [];
    const textBlock = `${personalInfo.summary} ${experience.map(e=>e.description).join(' ')} ${projects.map(p=>p.description).join(' ')}`.toLowerCase();
    
    const roleKeywords = ['Scalability', 'REST APIs', 'JWT Authorization', 'CI/CD automation', 'Microservices', 'Clean Code', 'Responsive UI'];
    roleKeywords.forEach(kw => {
      if (textBlock.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });
    const keywordScore = Math.round((matchedKeywords.length / roleKeywords.length) * 100);

    const overall = Math.round((skillScore * 0.3) + (experienceScore * 0.25) + (educationScore * 0.15) + (projScore * 0.15) + (keywordScore * 0.15));

    return {
      overallScore: overall,
      skillScore,
      experienceScore,
      educationScore,
      projectScore: projScore,
      keywordScore,
      matchedKeywords,
      missingKeywords,
      missingSkillsList: requiredSkills.filter(s => !candSkills.includes(s.toLowerCase()))
    };
  };

  const handleAtsUploadAndScore = async () => {
    if (!atsFile) {
      setAtsUploadError('Please select a resume file to analyze.');
      return;
    }

    setAtsUploading(true);
    setAtsUploadError('');

    const formData = new FormData();
    formData.append('file', atsFile);

    try {
      await api.post('/api/applications/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const profileRes = await api.get('/api/applications/profile/candidate');
      const profile = profileRes.data;

      const scoreData = calculateAtsScore(profile);
      setAtsScoreDetails(scoreData);

      setFlowStage('ANALYZE');
      setAnalyzeProgress(0);
      setAnalyzeStepText('Initializing parser...');

      const steps = [
        { progress: 20, text: 'Extracting candidate details & metadata...' },
        { progress: 45, text: 'Mapping experience records & hierarchy...' },
        { progress: 70, text: 'Scanning skill overlaps & keywords...' },
        { progress: 90, text: 'Calculating ATS score metrics...' },
        { progress: 100, text: 'Generating match recommendation...' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setAnalyzeProgress(step.progress);
        setAnalyzeStepText(step.text);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      setFlowStage('SCORE');
      showToast('success', 'ATS Analysis completed successfully!');
    } catch (err) {
      console.error(err);
      setAtsUploadError(err.response?.data?.message || 'Error uploading and parsing file. Ensure it is a valid PDF, DOC, or DOCX document.');
      showToast('error', 'ATS Analysis failed.');
    } finally {
      setAtsUploading(false);
    }
  };

  const renderResumePreview = () => {
    const isModern = selectedTemplate === 'Modern';
    const isExecutive = selectedTemplate === 'Executive';
    const isAts = selectedTemplate === 'ATS Friendly';

    const fontStyle = isExecutive ? 'font-serif' : 'font-sans';
    const headerColor = isModern ? 'text-brand-600' : (isExecutive ? 'text-slate-800' : (isAts ? 'text-black' : 'text-indigo-900'));

    return (
      <div className={`w-full max-w-4xl bg-white border border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl p-8 text-left ${fontStyle} text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900`}>
        {isModern ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 bg-slate-900 text-white p-6 rounded-xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">{personalInfo.name || 'Your Name'}</h2>
                <p className="text-xs text-brand-400 font-semibold">{targetRoleForAts}</p>
              </div>
              
              <div className="space-y-3 text-xs">
                <h3 className="font-bold border-b border-slate-700 pb-1 uppercase tracking-wider text-brand-400">Contact</h3>
                {personalInfo.email && <p className="break-all">📧 {personalInfo.email}</p>}
                {personalInfo.phone && <p>📞 {personalInfo.phone}</p>}
                {personalInfo.linkedin && <p className="break-all">🔗 {personalInfo.linkedin.replace(/https?:\/\/(www\.)?/, '')}</p>}
                {personalInfo.github && <p className="break-all">💻 {personalInfo.github.replace(/https?:\/\/(www\.)?/, '')}</p>}
                {personalInfo.portfolio && <p className="break-all">🌐 {personalInfo.portfolio.replace(/https?:\/\/(www\.)?/, '')}</p>}
              </div>

              {skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold border-b border-slate-700 pb-1 uppercase tracking-wider text-brand-400">Skills</h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-slate-850 text-brand-300 px-2.5 py-1 rounded-md border border-slate-750">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {certifications.filter(c => c.title).length > 0 && (
                <div className="space-y-3 text-xs">
                  <h3 className="font-bold border-b border-slate-700 pb-1 uppercase tracking-wider text-brand-400">Certifications</h3>
                  {certifications.filter(c => c.title).map((cert, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="font-bold text-white text-xs">{cert.title}</p>
                      <p className="text-[10px] text-slate-400">{cert.issuer} {cert.year && `(${cert.year})`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-8 space-y-6">
              {personalInfo.summary && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b pb-1">Profile Summary</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">{personalInfo.summary}</p>
                </div>
              )}

              {experience.filter(e => e.role || e.company).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b pb-1">Experience</h3>
                  {experience.filter(e => e.role || e.company).map((exp, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{exp.role} at <span className="text-brand-600">{exp.company}</span></h4>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 italic">{exp.duration}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {education.filter(edu => edu.degree || edu.school).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b pb-1">Education</h3>
                  {education.filter(edu => edu.degree || edu.school).map((edu, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{edu.degree}</h4>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 italic">{edu.year}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{edu.school}</p>
                    </div>
                  ))}
                </div>
              )}

              {projects.filter(p => p.title).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 border-b pb-1">Projects</h3>
                  {projects.filter(p => p.title).map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{proj.title}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white uppercase">{personalInfo.name || 'Your Name'}</h2>
              
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                {personalInfo.github && <span>• {personalInfo.github}</span>}
                {personalInfo.portfolio && <span>• {personalInfo.portfolio}</span>}
              </div>
              <div className="w-full border-b border-slate-350 pt-2"></div>
            </div>

            {personalInfo.summary && (
              <div className="space-y-1.5">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider ${headerColor}`}>Professional Summary</h3>
                <div className="border-b border-slate-200 dark:border-slate-800/80 my-1"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">{personalInfo.summary}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className="space-y-1.5">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider ${headerColor}`}>Technical Skills</h3>
                <div className="border-b border-slate-200 dark:border-slate-800/80 my-1"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{skills.join(', ')}</p>
              </div>
            )}

            {experience.filter(e => e.role || e.company).length > 0 && (
              <div className="space-y-1.5">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider ${headerColor}`}>Professional Experience</h3>
                <div className="border-b border-slate-200 dark:border-slate-800/80 my-1"></div>
                <div className="space-y-4 pt-1">
                  {experience.filter(e => e.role || e.company).map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-200">{exp.role} <span className="text-slate-400 font-normal">at</span> {exp.company}</h4>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 italic">{exp.duration}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.filter(edu => edu.degree || edu.school).length > 0 && (
              <div className="space-y-1.5">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider ${headerColor}`}>Education</h3>
                <div className="border-b border-slate-200 dark:border-slate-800/80 my-1"></div>
                <div className="space-y-3 pt-1">
                  {education.filter(edu => edu.degree || edu.school).map((edu, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-200">{edu.degree}</h4>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 italic">{edu.year}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects.filter(p => p.title).length > 0 && (
              <div className="space-y-1.5">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider ${headerColor}`}>Projects</h3>
                <div className="border-b border-slate-200 dark:border-slate-800/80 my-1"></div>
                <div className="space-y-3 pt-1">
                  {projects.filter(p => p.title).map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-200">{proj.title}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.filter(c => c.title).length > 0 && (
              <div className="space-y-1.5">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider ${headerColor}`}>Certifications</h3>
                <div className="border-b border-slate-200 dark:border-slate-800/80 my-1"></div>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
                  {certifications.filter(c => c.title).map((cert, idx) => (
                    <li key={idx} className="text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cert.title}</span>
                      {cert.issuer && ` — ${cert.issuer}`}
                      {cert.year && ` (${cert.year})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader className="animate-spin h-10 w-10 text-brand-500" />
        <p className="text-slate-500 font-semibold text-sm">Loading AI resume environments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Toast Alert */}
      {message.text && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 backdrop-blur-md' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 backdrop-blur-md'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="h-8 w-8 text-brand-500 animate-pulse" />
            AI Resume Builder Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Build resume drafts with deep AI enhancements, select templates, and preview real-time ATS match scores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {savedVersions.length > 0 && flowStage === 'GENERATE' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Restore Draft:</span>
              <select
                onChange={(e) => {
                  const ver = savedVersions.find(v => v.id.toString() === e.target.value);
                  if (ver) loadResumeVersion(ver);
                }}
                value={draftId || ''}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                {savedVersions.map((v) => (
                  <option key={v.id.toString()} value={v.id.toString()}>
                    v{v.version} - {new Date(v.updated_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {flowStage === 'GENERATE' && (
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              Save Draft
            </button>
          )}
        </div>
      </div>

      {/* Top 6-Stage Flow Guide */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl flex items-center justify-between gap-2 overflow-x-auto shadow-sm">
        {[
          { key: 'GENERATE', name: '1. Generate Resume' },
          { key: 'PREVIEW', name: '2. Preview Resume' },
          { key: 'DOWNLOAD', name: '3. Download PDF' },
          { key: 'UPLOAD', name: '4. Upload to ATS' },
          { key: 'ANALYZE', name: '5. Analyze Resume' },
          { key: 'SCORE', name: '6. View ATS Score' }
        ].map((stage, idx) => {
          const isDone = ['GENERATE', 'PREVIEW', 'DOWNLOAD', 'UPLOAD', 'ANALYZE', 'SCORE'].indexOf(flowStage) > idx;
          const isCurrent = flowStage === stage.key;
          return (
            <div
              key={stage.key}
              className={`flex items-center gap-2 text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shrink-0 ${
                isCurrent
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
                  : isDone
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span>{stage.name}</span>
              {isDone && <Check className="h-3.5 w-3.5" />}
            </div>
          );
        })}
      </div>

      {/* STAGE 1: GENERATE RESUME (WIZARD FORM) */}
      {flowStage === 'GENERATE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Wizard Form Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Progress Indicator */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-850 p-4 rounded-2xl flex items-center justify-between gap-1 overflow-x-auto shadow-sm">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const icons = [User, GraduationCap, Briefcase, Star, Target, Award];
                const StepIcon = icons[num - 1];
                return (
                  <button
                    key={num}
                    onClick={() => setStep(num)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      step === num
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <StepIcon className="h-4 w-4" />
                    <span>Step {num}</span>
                    {step > num && <Check className="h-3 w-3 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

            <div className="glass bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
              
              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-500" /> Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                        placeholder="Jane Doe"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        placeholder="jane.doe@example.com"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        placeholder="+1 (555) 019-2834"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={personalInfo.linkedin}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/janedoe"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">GitHub URL</label>
                      <input
                        type="url"
                        value={personalInfo.github}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                        placeholder="github.com/janedoe"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Portfolio Link</label>
                      <input
                        type="url"
                        value={personalInfo.portfolio}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
                        placeholder="janedoe.dev"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Professional Summary</label>
                      <button
                        type="button"
                        onClick={handleGenerateSummary}
                        disabled={aiLoading.summary}
                        className="px-3.5 py-1.5 bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/30 text-brand-500 dark:text-brand-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {aiLoading.summary ? <Loader className="animate-spin h-3 w-3" /> : <Sparkles className="h-3 w-3 animate-pulse" />}
                        Generate AI Summary Options
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      value={personalInfo.summary}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                      placeholder="Write your professional bio, summary or choose from generated suggestions..."
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm"
                    />

                    {personalInfo.summary && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleImproveGrammar('summary')}
                          disabled={aiLoading.grammar === 'summary'}
                          className="px-3 py-1 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-500 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {aiLoading.grammar === 'summary' ? <Loader className="animate-spin h-3 w-3" /> : <Wand2 className="h-3 w-3" />}
                          Polish Grammar
                        </button>
                      </div>
                    )}

                    {generatedSummaries.length > 0 && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 rounded-2xl space-y-3">
                        <span className="text-xs font-bold text-slate-400">AI Suggested Options (Click to select):</span>
                        <div className="space-y-2">
                          {generatedSummaries.map((sum, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                setPersonalInfo({ ...personalInfo, summary: sum });
                                setGeneratedSummaries([]);
                              }}
                              className="p-3 bg-white dark:bg-slate-900 border border-slate-200/70 hover:border-brand-500 dark:border-slate-800 dark:hover:border-brand-500 rounded-xl text-xs text-slate-600 dark:text-slate-300 cursor-pointer transition-colors shadow-sm"
                            >
                              {sum}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Education */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-brand-500" /> Academic Credentials
                    </h3>
                    <button
                      onClick={addEducation}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add School
                    </button>
                  </div>

                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/30 rounded-2xl space-y-4 relative">
                        {education.length > 1 && (
                          <button
                            onClick={() => removeEducation(index)}
                            className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-550/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Degree / Specialization</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              placeholder="B.Tech in Computer Science"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Institution / School</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => updateEducation(index, 'school', e.target.value)}
                              placeholder="IIT Madras"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => updateEducation(index, 'year', e.target.value)}
                              placeholder="2024"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Experience */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-brand-500" /> Work History
                    </h3>
                    <button
                      onClick={addExperience}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Experience
                    </button>
                  </div>

                  <div className="space-y-4">
                    {experience.map((exp, index) => (
                      <div key={index} className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/30 rounded-2xl space-y-4 relative">
                        {experience.length > 1 && (
                          <button
                            onClick={() => removeExperience(index)}
                            className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-550/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company Name</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              placeholder="Acme Corp"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Role Title</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => updateExperience(index, 'role', e.target.value)}
                              placeholder="Full Stack Engineer"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duration / Timeframe</label>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                              placeholder="June 2024 - Present"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description & Accomplishments</label>
                            <button
                              type="button"
                              onClick={() => handleRewriteExperience(index)}
                              disabled={aiLoading.rewrite === index}
                              className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {aiLoading.rewrite === index ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Sparkles className="h-3 w-3" />}
                              AI Rewrite Points
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            placeholder="e.g. Led development of web portals, wrote core API modules..."
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                          />
                          {exp.description && (
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleImproveGrammar('experience', index)}
                                disabled={aiLoading.grammar === index}
                                className="px-2.5 py-1 border border-indigo-500/25 text-indigo-500 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {aiLoading.grammar === index ? <Loader className="animate-spin h-3 w-3" /> : <Wand2 className="h-3 w-3" />}
                                Improve Grammar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Skills */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-brand-500" /> Core Skillsets
                    </h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={targetRoleForAts}
                        onChange={(e) => setTargetRoleForAts(e.target.value)}
                        className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        {TARGET_ROLES.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>

                      <button
                        onClick={handleGenerateSkills}
                        disabled={aiLoading.skills}
                        className="px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/30 text-brand-500 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {aiLoading.skills ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                        Generate Skills
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a new skill (e.g. React.js, Python, PostgreSQL)"
                      className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Add
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 rounded-2xl">
                    {skills.length > 0 ? (
                      skills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-500 text-white dark:bg-brand-500/25 dark:text-brand-400 px-3.5 py-1.5 rounded-full shadow-sm">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-200 font-bold">×</button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills listed yet. Click AI tools or input above to add.</span>
                    )}
                  </div>

                  {/* AI Suggestions Box */}
                  <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Skill Recommender</span>
                      <button
                        type="button"
                        onClick={handleSuggestSkills}
                        disabled={aiLoading.suggestedSkills}
                        className="px-2.5 py-1 border border-indigo-500/25 hover:bg-indigo-500/10 text-indigo-500 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {aiLoading.suggestedSkills ? <Loader className="animate-spin h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
                        Find Missing Skills
                      </button>
                    </div>

                    {suggestedSkills.length > 0 && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-400 block mb-2">Suggested Missing Skills for {targetRoleForAts} (Click to add):</span>
                        <div className="flex flex-wrap gap-2">
                          {suggestedSkills.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSkills([...skills, s]);
                                setSuggestedSkills(suggestedSkills.filter(item => item !== s));
                              }}
                              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-xs font-semibold rounded-lg shadow-sm cursor-pointer text-slate-900 dark:text-white"
                            >
                              + {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Projects */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-brand-500" /> Key Projects
                    </h3>
                    <button
                      onClick={addProject}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Project
                    </button>
                  </div>

                  <div className="space-y-4">
                    {projects.map((proj, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/30 rounded-2xl space-y-4 relative">
                        {projects.length > 1 && (
                          <button
                            onClick={() => removeProject(index)}
                            className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-550/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Title</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => updateProject(index, 'title', e.target.value)}
                            placeholder="AI Automated Analytics Engine"
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Description / Technical Stack</label>
                          <textarea
                            rows={3}
                            value={proj.description}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                            placeholder="Built custom pipeline endpoints, integrated charts, optimized with Redis cache for ES6 modules..."
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: Certifications */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-brand-500" /> Certifications
                    </h3>
                    <button
                      onClick={addCertification}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Certification
                    </button>
                  </div>

                  <div className="space-y-4">
                    {certifications.map((cert, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/30 rounded-2xl space-y-4 relative">
                        {certifications.length > 1 && (
                          <button
                            onClick={() => removeCertification(index)}
                            className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-550/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Certificate Title</label>
                            <input
                              type="text"
                              value={cert.title}
                              onChange={(e) => updateCertification(index, 'title', e.target.value)}
                              placeholder="AWS Solutions Architect"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Issuer Institution</label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                              placeholder="Amazon Web Services"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Year Earned</label>
                            <input
                              type="text"
                              value={cert.year}
                              onChange={(e) => updateCertification(index, 'year', e.target.value)}
                              placeholder="2025"
                              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-200/40 dark:border-slate-800/40">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                {step < 6 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const saved = await handleSaveDraft();
                      if (saved) {
                        setFlowStage('PREVIEW');
                      }
                    }}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-700 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/10"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin h-4 w-4" />
                        <span>Saving Draft...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Save & Preview Resume</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Templates and Keywords Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Keywords and Copilot tools */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-500 animate-pulse" /> Copilot Keyword Enhancer
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Job Keywords</span>
                  <button
                    type="button"
                    onClick={handleSuggestKeywords}
                    disabled={aiLoading.keywords}
                    className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {aiLoading.keywords ? <Loader className="animate-spin h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
                    Fetch Keywords
                  </button>
                </div>

                {suggestedKeywords.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Include these in experience points or summaries to boost match score:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100/30">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-100 dark:bg-slate-950/20 border border-slate-200/40 rounded-2xl text-center py-6 text-[11px] text-slate-500">
                    Select a role and click Fetch to view industry keyword density suggestions.
                  </div>
                )}
              </div>
            </div>

            {/* Template Selection */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-500" /> Resume Template Layout
              </h3>

              <div className="space-y-2">
                {RESUME_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTemplate === tmpl.id
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{tmpl.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{tmpl.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STAGE 2: PREVIEW RESUME */}
      {flowStage === 'PREVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Visual Preview */}
          <div className="lg:col-span-8 space-y-6 text-center">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-brand-500" /> Styled Resume Live Preview
              </h3>
            </div>

            {renderResumePreview()}

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setFlowStage('GENERATE')}
                className="px-5 py-3 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={() => setFlowStage('DOWNLOAD')}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                Next: Download PDF <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Template Choice sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-500" /> Switch Live Template
              </h3>
              <p className="text-[11px] text-slate-500">Pick a style to watch the formatting changes apply live on your preview.</p>

              <div className="space-y-2">
                {RESUME_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTemplate === tmpl.id
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{tmpl.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{tmpl.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: DOWNLOAD RESUME PDF */}
      {flowStage === 'DOWNLOAD' && (
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Prominent requirement message banner */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-sm">
            <p className="text-sm font-semibold leading-relaxed text-center">
              "To use the ATS Resume Analyzer and job application features, please download your AI-generated resume and upload it to the ATS system."
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/60 shadow-md text-center space-y-6">
            <div className="p-4 bg-brand-500/10 dark:bg-brand-500/20 rounded-2xl w-fit mx-auto text-brand-600 dark:text-brand-400">
              <FileText className="h-12 w-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Your PDF Resume is Ready!</h3>
              <p className="text-sm text-slate-500">
                Filename: <strong className="text-slate-700 dark:text-slate-300">{personalInfo.name.replace(/\s+/g, '_')}_Resume_v{savedVersions.find(v => v.id === draftId)?.version || 1}.pdf</strong>
              </p>
            </div>

            <button
              onClick={() => handleExport('pdf')}
              disabled={pdfLoading}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
            >
              {pdfLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  <span>Generating PDF Document...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Download Resume PDF</span>
                </>
              )}
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => setFlowStage('PREVIEW')}
              className="px-5 py-3 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
            >
              Back to Preview
            </button>

            <button
              type="button"
              onClick={() => setFlowStage('UPLOAD')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              Next: Upload to ATS <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: UPLOAD RESUME TO ATS */}
      {flowStage === 'UPLOAD' && (
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Prominent requirement message banner */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-sm">
            <p className="text-sm font-semibold leading-relaxed text-center">
              "To use the ATS Resume Analyzer and job application features, please download your AI-generated resume and upload it to the ATS system."
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900/60 shadow-md space-y-6">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white text-center">Upload Document to ATS Engine</h3>
            
            {atsUploadError && (
              <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-250 text-rose-600 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{atsUploadError}</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setAtsFile(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative ${
                dragActive ? 'border-brand-500 bg-brand-50/10' : 'border-slate-300 dark:border-slate-800 hover:border-brand-400'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAtsFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                {atsFile ? atsFile.name : 'Choose or Drag your downloaded PDF file here'}
              </span>
              <span className="block text-xs text-slate-400 mt-1">Accepts PDF, DOCX, DOC files up to 10MB</span>
            </div>

            {atsFile && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400 break-all">{atsFile.name} ({(atsFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button
                  onClick={() => setAtsFile(null)}
                  className="text-red-500 hover:text-red-650 font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => setFlowStage('DOWNLOAD')}
              className="px-5 py-3 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
            >
              Back to Download
            </button>

            <button
              type="button"
              onClick={handleAtsUploadAndScore}
              disabled={!atsFile || atsUploading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {atsUploading ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  <span>Uploading File...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run ATS Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: ANALYZING RESUME (HIGH-TECH SCANNERS) */}
      {flowStage === 'ANALYZE' && (
        <div className="max-w-xl mx-auto py-16 text-center space-y-8">
          <div className="relative w-40 h-40 mx-auto bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
            {/* Holographic scanner line */}
            <div className="absolute top-0 w-full h-1 bg-brand-500 shadow-md shadow-brand-500/50 animate-[scan_2s_ease-in-out_infinite]"></div>
            <FileText className="h-16 w-16 text-brand-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Evaluating Resume Document...</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{analyzeStepText}</p>
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Overall Parse Progress</span>
              <span>{analyzeProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
              <div
                className="h-full bg-brand-500 transition-all duration-300"
                style={{ width: `${analyzeProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 6: VIEW ATS SCORE */}
      {flowStage === 'SCORE' && atsScoreDetails && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Prominent requirement message banner */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-sm">
            <p className="text-sm font-semibold leading-relaxed text-center">
              "To use the ATS Resume Analyzer and job application features, please download your AI-generated resume and upload it to the ATS system."
            </p>
          </div>

          <div className="glass bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 p-6 md:p-8 rounded-3xl space-y-8 shadow-md">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="h-6 w-6 text-brand-500" /> ATS Analyzer Evaluator
                </h3>
                <p className="text-xs text-slate-500 mt-1">Calculated against standards for target role: <strong className="text-slate-700 dark:text-slate-350">{targetRoleForAts}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Score circle */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/30 dark:border-slate-850 rounded-3xl text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall ATS Score</span>
                <div className="relative flex items-center justify-center h-28 w-28 my-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-slate-200 dark:stroke-slate-800 fill-transparent" strokeWidth="8"/>
                    <circle cx="56" cy="56" r="48" 
                      className={`fill-transparent transition-all duration-1000 ${
                        atsScoreDetails.overallScore >= 80 ? 'stroke-emerald-500' : atsScoreDetails.overallScore >= 60 ? 'stroke-amber-500' : 'stroke-red-500'
                      }`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - atsScoreDetails.overallScore / 100)}
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold text-slate-900 dark:text-white">
                    {atsScoreDetails.overallScore}
                  </span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  atsScoreDetails.overallScore >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                }`}>
                  {atsScoreDetails.overallScore >= 80 ? 'Highly Match' : 'Consider Match'}
                </span>
              </div>

              {/* Scorecard breakdowns */}
              <div className="md:col-span-8 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Match score breakdown:</h4>
                <div className="space-y-3">
                  {/* Skill match */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Skill Match Score</span>
                      <span>{atsScoreDetails.skillScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 transition-all" style={{ width: `${atsScoreDetails.skillScore}%` }}></div>
                    </div>
                  </div>
                  {/* Experience Match */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Experience Match Score</span>
                      <span>{atsScoreDetails.experienceScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 transition-all" style={{ width: `${atsScoreDetails.experienceScore}%` }}></div>
                    </div>
                  </div>
                  {/* Education match */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Education Match Score</span>
                      <span>{atsScoreDetails.educationScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 transition-all" style={{ width: `${atsScoreDetails.educationScore}%` }}></div>
                    </div>
                  </div>
                  {/* Project relevance match */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Project Relevance Score</span>
                      <span>{atsScoreDetails.projectScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 transition-all" style={{ width: `${atsScoreDetails.projectScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword grid matches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/35 dark:border-slate-800/40">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  ✓ Matched Keywords ({atsScoreDetails.matchedKeywords.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {atsScoreDetails.matchedKeywords.length > 0 ? (
                    atsScoreDetails.matchedKeywords.map((kw, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">None matched yet.</span>
                  )}
                </div>
              </div>
            </div>

            {atsScoreDetails.missingSkillsList.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ⚡ Suggested Skills Gap ({atsScoreDetails.missingSkillsList.length})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {atsScoreDetails.missingSkillsList.map((skill, idx) => (
                    <span key={idx} className="text-[10px] font-bold bg-brand-50 dark:bg-brand-950/40 text-brand-500 dark:text-brand-400 px-2.5 py-1 rounded-md border border-brand-100/30">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setAtsFile(null);
                  setAtsScoreDetails(null);
                  setFlowStage('GENERATE');
                }}
                className="px-5 py-3 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
              >
                Edit Resume Again
              </button>

              <button
                type="button"
                onClick={() => navigate('/applicant/jobs')}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                Search Jobs & Apply <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AiResumeBuilder;
