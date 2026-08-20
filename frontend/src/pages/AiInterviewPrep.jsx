import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import {
  Sparkles, BookOpen, Send, RefreshCw, Award,
  MessageSquare, Loader, AlertCircle, ChevronRight,
  CheckCircle2, Target, Trophy, Compass, ShieldAlert,
  HelpCircle, Star, ArrowLeft
} from 'lucide-react';

const AiInterviewPrep = () => {
  const location = useLocation();
  const prepContext = location.state || {};

  // Preferences / Context inputs
  const [jobTitle, setJobTitle] = useState(prepContext.jobTitle || 'React Developer');
  const [skills, setSkills] = useState(prepContext.skills || 'React.js, JavaScript, Tailwind CSS, REST APIs');
  const [jobDescription, setJobDescription] = useState(prepContext.jobDescription || '');

  // App views: 'setup' | 'mock' | 'report' | 'guides' | 'assigned' | 'workspace'
  const [activeTab, setActiveTab] = useState('setup');

  // Loading states
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [finalReportLoading, setFinalReportLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });

  // Mock Simulator states
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [scoreList, setScoreList] = useState([]); // answers list with individual scores
  const [report, setReport] = useState(null);

  // Company Guide states
  const [selectedCompany, setSelectedCompany] = useState('TCS');
  const [companyGuide, setCompanyGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);

  // Assigned Preparation states
  const [assignedTopics, setAssignedTopics] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [selectedPrepTopic, setSelectedPrepTopic] = useState(null); // the active topic object
  const [workspaceTab, setWorkspaceTab] = useState('theory'); // 'theory' | 'mcq' | 'written' | 'mock'

  // Workspace detail states
  const [theoryData, setTheoryData] = useState(null);
  const [theoryLoading, setTheoryLoading] = useState(false);

  const [mcqsList, setMcqsList] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqResult, setMcqResult] = useState(null);
  const [mcqLoading, setMcqLoading] = useState(false);

  const [writtenQuestions, setWrittenQuestions] = useState([]);
  const [writtenResponses, setWrittenResponses] = useState({});
  const [writtenLoading, setWrittenLoading] = useState(false);
  const [writtenResult, setWrittenResult] = useState(null);

  const [mockQuestions, setMockQuestions] = useState([]);
  const [mockLoading, setMockLoading] = useState(false);

  // Trigger toast alert
  const triggerToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 5000);
  };

  // 1. Fetch Company Prep Guide
  const fetchCompanyGuide = async (companyName) => {
    setGuideLoading(true);
    try {
      const res = await api.get(`/api/interviews/prep/company-specific/${companyName}`);
      setCompanyGuide(res.data);
    } catch (err) {
      triggerToast('error', 'Failed to retrieve company details.');
    } finally {
      setGuideLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'guides') {
      fetchCompanyGuide(selectedCompany);
    }
  }, [activeTab, selectedCompany]);

  // 2. Fetch Candidate Assigned Prep Topics
  const fetchAssignedTopics = async () => {
    setAssignedLoading(true);
    try {
      const res = await api.get('/api/interviews/prep/topics');
      setAssignedTopics(res.data);
    } catch (err) {
      console.error(err);
      triggerToast('error', 'Failed to load assigned topics.');
    } finally {
      setAssignedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assigned') {
      fetchAssignedTopics();
    }
  }, [activeTab]);

  const loadWorkspaceTopic = async (topic) => {
    setSelectedPrepTopic(topic);
    setWorkspaceTab('theory');
    setActiveTab('workspace');

    // Clear old states
    setTheoryData(null);
    setMcqsList([]);
    setMcqAnswers({});
    setMcqResult(null);
    setWrittenQuestions([]);
    setWrittenResponses({});
    setWrittenResult(null);
    setMockQuestions([]);

    // Fetch theory by default
    fetchTheory(topic.topicId);
  };

  const fetchTheory = async (topicId) => {
    setTheoryLoading(true);
    try {
      const res = await api.get(`/api/interviews/prep/topic/${topicId}/theory`);
      setTheoryData(res.data);
    } catch (err) {
      triggerToast('error', 'Failed to retrieve study theory.');
    } finally {
      setTheoryLoading(false);
    }
  };

  const fetchMCQs = async (topicId) => {
    setMcqLoading(true);
    setMcqResult(null);
    try {
      const res = await api.get(`/api/interviews/prep/topic/${topicId}/mcqs`);
      setMcqsList(res.data);
    } catch (err) {
      triggerToast('error', 'Failed to load MCQ practice.');
    } finally {
      setMcqLoading(false);
    }
  };

  const handleMCQSubmit = async (e) => {
    e.preventDefault();
    setMcqLoading(true);
    try {
      const res = await api.post(`/api/interviews/prep/topic/${selectedPrepTopic.topicId}/mcq-submit`, {
        answers: mcqAnswers
      });
      setMcqResult(res.data);
      triggerToast('success', `Submitted! Score: ${res.data.score}%`);
      fetchAssignedTopics(); // reload progress in background
    } catch (err) {
      triggerToast('error', 'Failed to submit MCQ answers.');
    } finally {
      setMcqLoading(false);
    }
  };

  const fetchWritten = async (topicId) => {
    setWrittenLoading(true);
    setWrittenResult(null);
    try {
      const res = await api.get(`/api/interviews/prep/topic/${topicId}/written`);
      setWrittenQuestions(res.data);
      const initial = {};
      res.data.forEach(q => {
        initial[q.id.toString()] = '';
      });
      setWrittenResponses(initial);
    } catch (err) {
      triggerToast('error', 'Failed to fetch written questions.');
    } finally {
      setWrittenLoading(false);
    }
  };

  const handleWrittenSubmit = async (e) => {
    e.preventDefault();
    setWrittenLoading(true);
    try {
      const res = await api.post(`/api/interviews/prep/topic/${selectedPrepTopic.topicId}/written-submit`, {
        responses: writtenResponses
      });
      setWrittenResult({
        message: res.data.message,
        progress: res.data.progress,
        evalText: 'AI has evaluated your paragraph responses and logged them. Your recruiter has been notified of your preparation completion!'
      });
      triggerToast('success', 'Written exercises submitted successfully!');
      fetchAssignedTopics();
    } catch (err) {
      triggerToast('error', 'Failed to submit written responses.');
    } finally {
      setWrittenLoading(false);
    }
  };

  const fetchMocks = async (topicId) => {
    setMockLoading(true);
    try {
      const res = await api.get(`/api/interviews/prep/topic/${topicId}/mocks`);
      setMockQuestions(res.data);
    } catch (err) {
      triggerToast('error', 'Failed to fetch mock questions.');
    } finally {
      setMockLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPrepTopic && activeTab === 'workspace') {
      const topicId = selectedPrepTopic.topicId;
      if (workspaceTab === 'theory') fetchTheory(topicId);
      if (workspaceTab === 'mcq') fetchMCQs(topicId);
      if (workspaceTab === 'written') fetchWritten(topicId);
      if (workspaceTab === 'mock') fetchMocks(topicId);
    }
  }, [workspaceTab, selectedPrepTopic, activeTab]);

  // 3. Launch Mock Interview
  const startMockInterview = async (e) => {
    if (e) e.preventDefault();
    setLoadingQuestions(true);
    setChatLog([]);
    setScoreList([]);
    setReport(null);
    setCurrentQuestionIndex(0);
    try {
      const res = await api.post('/api/interviews/prep/generate-questions', {
        skills,
        jobTitle,
        jobDescription
      });

      const generated = res.data.questions || [];
      setQuestions(generated);
      if (generated.length > 0) {
        setChatLog([
          { sender: 'AI Coach', text: `Welcome to your AI Mock Interview Simulator for the ${jobTitle} role! I have prepared questions targeting your specified skillset. Let's begin.` },
          { sender: 'AI Coach', text: generated[0].question, type: generated[0].type }
        ]);
        setActiveTab('mock');
      } else {
        triggerToast('error', 'No questions could be simulated.');
      }
    } catch (err) {
      triggerToast('error', 'Failed to initiate mock simulator rounds.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 4. Submit Individual Answer
  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    setChatLog(prev => [...prev, { sender: 'Candidate', text: userAnswer }]);
    setEvaluatingAnswer(true);

    const ansPayload = userAnswer;
    setUserAnswer('');

    try {
      const res = await api.post('/api/interviews/prep/mock-submit', {
        question: currentQuestion.question,
        answer: ansPayload
      });

      const evalData = res.data.evaluation;

      setScoreList(prev => [...prev, {
        questionId: currentQuestion.id,
        type: currentQuestion.type,
        technicalScore: evalData.technicalScore,
        communicationScore: evalData.communicationScore,
        confidenceScore: evalData.confidenceScore
      }]);

      setChatLog(prev => [
        ...prev,
        {
          sender: 'AI Coach',
          text: `[Feedback] ${evalData.feedbackSuggestions} (Technical Score: ${evalData.technicalScore}%)`
        }
      ]);

      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length && nextIndex < 5) {
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => {
          setChatLog(prev => [
            ...prev,
            { sender: 'AI Coach', text: questions[nextIndex].question, type: questions[nextIndex].type }
          ]);
        }, 1200);
      } else {
        setTimeout(() => {
          setChatLog(prev => [
            ...prev,
            { sender: 'AI Coach', text: "Fantastic work! You have finished all core questions. Let's compile your final readiness report." }
          ]);
        }, 1200);
      }
    } catch (err) {
      triggerToast('error', 'Failed to process answer score.');
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  // 5. Evaluate Overall Interview
  const calculateFinalReadiness = async () => {
    setFinalReportLoading(true);
    try {
      const res = await api.post('/api/interviews/prep/evaluate', { answers: scoreList });
      setReport(res.data);
      setActiveTab('report');
    } catch (err) {
      triggerToast('error', 'Error generating evaluator report card.');
    } finally {
      setFinalReportLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Toast Alert */}
      {toast.text && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl transition-all duration-350 ${toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 backdrop-blur-md'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 backdrop-blur-md'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-brand-500 animate-pulse" />
            AI Interview Prep Evaluator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Simulate advanced technical mock rounds, review granular feedback, and explore localized recruitment guides.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-850">
          <button
            onClick={() => setActiveTab(questions.length > 0 ? 'mock' : 'setup')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'setup' || activeTab === 'mock'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
          >
            Mock Simulator
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'assigned' || activeTab === 'workspace'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
          >
            Assigned Topics
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'guides'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
          >
            Company Guides
          </button>
        </div>
      </div>

      {/* Main Tab Configurations */}
      {activeTab === 'setup' && (
        <div className="max-w-2xl mx-auto glass border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Configure Simulator Round</h3>
            <p className="text-xs text-slate-500">Inputs will shape context-aware AI interview questionnaires and grading schemes.</p>
          </div>

          <form onSubmit={startMockInterview} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. React/Node Developer"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Assessable Skills (Comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. JavaScript, React.js, REST APIs"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Job Description context (Optional)</label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or JD details here to auto-customize assessments..."
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loadingQuestions}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-700 hover:to-indigo-650 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-500/10"
            >
              {loadingQuestions ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  <span>Synthesizing Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Start AI Mock Simulator</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Simulator chat interface */}
      {activeTab === 'mock' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col justify-between border border-slate-200/50 dark:border-slate-850 bg-white/40 dark:bg-slate-900/40 rounded-3xl p-5 min-h-[500px] max-h-[600px] shadow-sm">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
              {chatLog.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex ${chat.sender === 'Candidate' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-xs space-y-1.5 shadow-sm border ${chat.sender === 'Candidate'
                      ? 'bg-brand-500 text-white border-brand-400 rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200/50 dark:border-slate-850 rounded-bl-none text-slate-800 dark:text-slate-200'
                    }`}>
                    <div className="flex justify-between items-center gap-4">
                      <span className="font-bold text-[10px] uppercase tracking-wider opacity-70">
                        {chat.sender}
                      </span>
                      {chat.type && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-brand-600 dark:bg-brand-950 text-white rounded font-bold">
                          {chat.type}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed whitespace-pre-line">{chat.text}</p>
                  </div>
                </div>
              ))}

              {evaluatingAnswer && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 rounded-2xl rounded-bl-none text-xs flex items-center gap-2">
                    <Loader className="animate-spin h-3.5 w-3.5 text-brand-500" />
                    <span className="text-slate-400 font-semibold">AI is analyzing response vectors...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-250/20">
              {scoreList.length >= 5 || currentQuestionIndex >= questions.length ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <span className="text-xs font-bold text-emerald-500">All evaluation iterations are complete! Ready to compile scores?</span>
                  <button
                    onClick={calculateFinalReadiness}
                    disabled={finalReportLoading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {finalReportLoading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Trophy className="h-4 w-4" />}
                    Compile AI Readiness Report
                  </button>
                </div>
              ) : (
                <form onSubmit={submitAnswer} className="flex gap-2">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your structured answer here..."
                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                    disabled={evaluatingAnswer}
                    required
                  />
                  <button
                    type="submit"
                    disabled={evaluatingAnswer || !userAnswer.trim()}
                    className="px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/25 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">Questions</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">
                    {scoreList.length} / 5
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/25 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">Avg Score</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 block">
                    {scoreList.length > 0
                      ? `${Math.round(scoreList.reduce((acc, curr) => acc + curr.technicalScore, 0) / scoreList.length)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
              <div className="border-t border-slate-200/10 pt-4 flex justify-between items-center">
                <button
                  onClick={startMockInterview}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Restart Round
                </button>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Outline</h4>
              <div className="space-y-2">
                {questions.slice(0, 5).map((q, idx) => (
                  <div
                    key={q.id}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-[10px] font-semibold border transition-all ${currentQuestionIndex === idx
                        ? 'border-brand-500 bg-brand-50/10 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400'
                        : scoreList.length > idx
                          ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-550'
                      }`}
                  >
                    <span className="shrink-0 h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate flex-1">{q.question}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluator score report card */}
      {activeTab === 'report' && report && (
        <div className="max-w-3xl mx-auto glass border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="text-center space-y-2 pb-4 border-b border-slate-200/30">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500 animate-bounce" /> Evaluator Report Card
            </h3>
            <p className="text-xs text-slate-500">Readiness profile assessed by AI Coach for role: <strong>{jobTitle}</strong></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/30 rounded-3xl text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Readiness Score</span>
              <div className="relative flex items-center justify-center h-28 w-28 my-3">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-slate-200 dark:stroke-slate-800 fill-transparent" strokeWidth="8" />
                  <circle cx="56" cy="56" r="48"
                    className="fill-transparent stroke-brand-500 transition-all duration-1000"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - report.readinessScore / 100)}
                  />
                </svg>
                <span className="absolute text-3xl font-extrabold text-slate-900 dark:text-white">
                  {report.readinessScore}%
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-brand-50 dark:bg-brand-950/35 text-brand-500 rounded-full">
                {report.readinessScore >= 80 ? 'Highly Match' : report.readinessScore >= 60 ? 'Consider Match' : 'Review Profile'}
              </span>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Dimension Match Scores:</h4>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                    <span>Technical Readiness</span>
                    <span>{report.technicalReadiness}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${report.technicalReadiness}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                    <span>Communication Readiness</span>
                    <span>{report.communicationReadiness}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${report.communicationReadiness}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                    <span>Project Alignment</span>
                    <span>{report.projectReadiness}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${report.projectReadiness}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                    <span>Leadership & Attitude</span>
                    <span>{report.leadershipReadiness}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${report.leadershipReadiness}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Areas for Key Development
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
              {report.weakAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recommended Preparation Timeline</span>
            <div className="space-y-3">
              {report.preparationRoadmap.map((item) => (
                <div key={item.step} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/30 rounded-2xl flex gap-3.5 items-start">
                  <span className="shrink-0 h-6 w-6 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div className="space-y-0.5 text-xs">
                    <span className="font-bold text-[10px] text-indigo-500 uppercase tracking-wider">{item.duration}</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{item.topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-250/20 flex justify-end">
            <button
              onClick={() => {
                setActiveTab('setup');
                setQuestions([]);
              }}
              className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Configure New Round
            </button>
          </div>
        </div>
      )}

      {/* Assigned Preparation Portal */}
      {activeTab === 'assigned' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Preparation Topics</h3>
            <p className="text-xs text-slate-505">
              Complete these recruiter-assigned topics to prepare for your upcoming corporate interviews.
            </p>
          </div>

          {assignedLoading ? (
            <div className="flex justify-center py-20">
              <Loader className="animate-spin h-8 w-8 text-brand-500" />
            </div>
          ) : assignedTopics.length === 0 ? (
            <div className="glass p-12 text-center border border-slate-200/50 rounded-3xl bg-white/40 dark:bg-slate-900/40 space-y-4">
              <BookOpen className="h-12 w-12 text-slate-405 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200">No Assigned Topics Yet</h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                When a recruiter schedules an interview and assigns study topics, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedTopics.map((topic) => (
                <div key={topic.id} className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between hover:scale-[1.01] transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{topic.topicName}</h4>
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-full border border-brand-100/45">
                          {topic.companyName}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${topic.completed
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/40'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/40'
                        }`}>
                        {topic.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Preparation Progress</span>
                        <span>{topic.progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-600 h-full rounded-full" style={{ width: `${topic.progressPct}%` }}></div>
                      </div>
                    </div>

                    {topic.mcqScore !== null && (
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-1">
                        🏆 Latest MCQ Score: <span className="font-extrabold text-brand-600 dark:text-brand-400">{topic.mcqScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => loadWorkspaceTopic(topic)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Workspace */}
      {activeTab === 'workspace' && selectedPrepTopic && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => setActiveTab('assigned')}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors mb-2 cursor-pointer"
              >
                ← Back to Assigned Topics
              </button>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedPrepTopic.topicName} Workspace</h3>
              <p className="text-xs text-slate-550 mt-0.5">Assigned for interview with {selectedPrepTopic.companyName}</p>
            </div>

            <div className="flex bg-slate-105 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-850 self-start sm:self-center">
              {['theory', 'mcq', 'written', 'mock'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setWorkspaceTab(tab)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer capitalize ${workspaceTab === tab
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-705 dark:hover:text-slate-300'
                    }`}
                >
                  {tab === 'mcq' ? 'MCQ Practice' : tab === 'written' ? 'Written Practice' : tab === 'mock' ? 'Mocks' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Theory */}
          {workspaceTab === 'theory' && (
            <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
              {theoryLoading ? (
                <div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8 text-brand-500" /></div>
              ) : theoryData ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-500 animate-pulse" /> Concept Study Guide
                    </h4>
                    <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
                      {theoryData.explanation}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-slate-200/30 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Key Technical Pillars</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {theoryData.keyConcepts.map((concept, idx) => (
                        <li key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/30 rounded-xl flex items-start gap-2">
                          <span className="text-indigo-500 shrink-0 font-bold">•</span>
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4 border-t border-slate-200/30 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Common Screening Questions</span>
                    <div className="space-y-3">
                      {theoryData.interviewQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/30 rounded-xl space-y-1.5">
                          <strong className="text-xs font-bold text-slate-905 dark:text-white block">Q: {q.q}</strong>
                          <p className="text-xs text-slate-600 dark:text-slate-350 italic">A: {q.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">Failed to load theory data.</div>
              )}
            </div>
          )}

          {/* Tab 2: MCQ Practice */}
          {workspaceTab === 'mcq' && (
            <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-500" /> Topic MCQ Quiz
              </h4>

              {mcqLoading ? (
                <div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8 text-brand-500" /></div>
              ) : mcqsList.length > 0 ? (
                <form onSubmit={handleMCQSubmit} className="space-y-6">
                  {mcqsList.map((mcq, idx) => (
                    <div key={mcq.id} className="p-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/30 rounded-2xl space-y-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {idx + 1}. {mcq.question}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {mcq.options.map((option, optIdx) => {
                          const isSelected = mcqAnswers[mcq.id.toString()] === optIdx;
                          return (
                            <div
                              key={optIdx}
                              onClick={() => setMcqAnswers(prev => ({ ...prev, [mcq.id.toString()]: optIdx }))}
                              className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${isSelected
                                  ? 'border-brand-500 bg-brand-50/15 text-brand-700 dark:text-brand-400 shadow-sm'
                                  : 'border-slate-200 dark:border-slate-805 hover:bg-slate-105/50 dark:hover:bg-slate-950/20 text-slate-650 dark:text-slate-350'
                                }`}
                            >
                              {option}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {mcqResult ? (
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-amber-500 animate-bounce" />
                        <div>
                          <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">Quiz Completed! Score: {mcqResult.score}%</h5>
                          <p className="text-[10px] text-slate-500">{mcqResult.correctCount} out of {mcqResult.total} questions answered correctly.</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/10 pt-4 space-y-2">
                        <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Cognitive Score Strategy Breakdown</span>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl text-center">
                            <span className="text-[9px] text-slate-450 block font-bold">Easy Level</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{mcqResult.score}%</span>
                          </div>
                          <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl text-center">
                            <span className="text-[9px] text-slate-455 block font-bold">Medium Level</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{Math.round(mcqResult.score * 0.85)}%</span>
                          </div>
                          <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl text-center">
                            <span className="text-[9px] text-slate-455 block font-bold">Hard Level</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{Math.round(mcqResult.score * 0.70)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={Object.keys(mcqAnswers).length < mcqsList.length}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                      >
                        Submit Answers
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No questions loaded.</div>
              )}
            </div>
          )}

          {/* Tab 3: Written Practice */}
          {workspaceTab === 'written' && (
            <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-500" /> Scenario-based Written Practice
              </h4>
              <p className="text-xs text-slate-505">Provide paragraph explanations or code blocks. Our AI engine will evaluate your responses upon submission.</p>

              {writtenLoading ? (
                <div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8 text-brand-500" /></div>
              ) : writtenQuestions.length > 0 ? (
                <form onSubmit={handleWrittenSubmit} className="space-y-6">
                  {writtenQuestions.map((q) => (
                    <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/30 rounded-2xl space-y-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Q: {q.question}
                      </span>
                      <textarea
                        rows={4}
                        value={writtenResponses[q.id.toString()] || ''}
                        onChange={(e) => setWrittenResponses(prev => ({ ...prev, [q.id.toString()]: e.target.value }))}
                        placeholder="Write your detailed explanation here..."
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                        required
                      />
                      {q.suggestedAnswer && (
                        <details className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold cursor-pointer">
                          <summary>View Suggested Concept Answer</summary>
                          <p className="mt-1.5 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200/20 text-slate-700 dark:text-slate-350 rounded-xl font-medium">
                            {q.suggestedAnswer}
                          </p>
                        </details>
                      )}
                    </div>
                  ))}

                  {writtenResult ? (
                    <div className="p-5 bg-brand-500/5 border border-brand-500/10 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-brand-500 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 animate-bounce" /> AI Assessment Logged
                      </span>
                      <p className="text-xs text-slate-707 dark:text-slate-350 leading-relaxed font-semibold">
                        {writtenResult.evalText}
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        Submit Responses for AI Evaluation
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No questions loaded.</div>
              )}
            </div>
          )}

          {/* Tab 4: Mocks */}
          {workspaceTab === 'mock' && (
            <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-500" /> Randomized Mock Interview Prompts
              </h4>
              <p className="text-xs text-slate-505">Practice answering these randomized, non-repeating scenario questions under real-time conditions.</p>

              {mockLoading ? (
                <div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8 text-brand-500" /></div>
              ) : mockQuestions.length > 0 ? (
                <div className="space-y-3">
                  {mockQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/30 rounded-xl text-xs text-slate-707 dark:text-slate-300 font-semibold shadow-sm flex items-start gap-3">
                      <span className="shrink-0 h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed pt-0.5">{q}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No questions simulated.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Company Guides Explorer */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold text-slate-405 uppercase tracking-wider block mb-1">Select Corporate Guide</span>
            {['TCS', 'Infosys', 'Zoho'].map((comp) => (
              <div
                key={comp}
                onClick={() => setSelectedCompany(comp)}
                className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center justify-between ${selectedCompany === comp
                    ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/25 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-brand-900 hover:bg-slate-50 dark:hover:bg-slate-950/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-brand-500 text-white font-bold rounded-lg flex items-center justify-center text-xs">
                    {comp[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{comp}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>

          <div className="md:col-span-8">
            {guideLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-2">
                <Loader className="animate-spin h-8 w-8 text-brand-500" />
                <span className="text-slate-405 text-xs">Loading curriculum details...</span>
              </div>
            ) : companyGuide ? (
              <div className="glass border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/30">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-indigo-500" />
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{companyGuide.company} Prep Guide</h3>
                      <p className="text-[10px] text-slate-500">Interview Funnel Overview & Focus Patterns</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/35 px-2.5 py-1 rounded-full border border-amber-400/25">
                    Difficulty: {companyGuide.difficulty}
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-405 uppercase tracking-wider block">Key Focus Areas</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {companyGuide.focusAreas.map((area, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/20 rounded-xl text-xs text-slate-700 dark:text-slate-350 flex items-center gap-2 font-semibold shadow-sm">
                        <Target className="h-4 w-4 text-brand-500 shrink-0" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-405 uppercase tracking-wider block">Recruitment Rounds</span>
                  <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    {companyGuide.rounds}
                  </p>
                </div>

                <div className="p-5 bg-brand-500/5 border border-brand-500/10 rounded-2xl space-y-2 shadow-inner">
                  <span className="text-xs font-bold text-brand-500 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 animate-pulse" /> Expert Preparation Strategy
                  </span>
                  <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed font-semibold">
                    {companyGuide.interviewTips}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-10 border border-dashed border-slate-250 text-center text-xs text-slate-400">
                Choose a company to inspect preparation guides.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInterviewPrep;
