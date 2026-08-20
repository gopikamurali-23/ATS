import prisma from '../config/db.js';
import { sendRealTimeNotification } from '../services/notificationService.js';

// 1. Schedule Interview (Company Recruiter)
export const scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      interviewDate,
      interviewTime,
      interviewMode,
      meetingLink,
      officeAddress,
      interviewRound,
      instructions,
      preparationTopics
    } = req.body;

    if (!applicationId || !interviewDate || !interviewTime || !interviewMode || !interviewRound) {
      return res.status(400).json({ message: 'Missing required scheduling fields.' });
    }

    const application = await prisma.applications.findUnique({
      where: { id: BigInt(applicationId) },
      include: {
        candidates: true,
        jobs: {
          include: { companies: true }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    // Save transactionally
    const scheduled = await prisma.$transaction(async (tx) => {
      // Create interview entry
      const interview = await tx.interviews.create({
        data: {
          application_id: BigInt(applicationId),
          interview_date: new Date(interviewDate),
          interview_time: interviewTime,
          interview_mode: interviewMode,
          meeting_link: interviewMode === 'ONLINE' ? meetingLink : null,
          office_address: interviewMode === 'OFFLINE' ? officeAddress : null,
          interview_round: interviewRound,
          instructions: instructions || null,
          status: 'SCHEDULED',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Update application funnel status to UNDER_REVIEW
      await tx.applications.update({
        where: { id: BigInt(applicationId) },
        data: { status: 'UNDER_REVIEW' }
      });

      // Create topic progress trackers for candidate
      if (preparationTopics && Array.isArray(preparationTopics)) {
        for (const topicName of preparationTopics) {
          const prepTopic = await tx.interview_preparation_topics.create({
            data: {
              interview_id: interview.id,
              name: topicName
            }
          });

          await tx.preparation_progresses.create({
            data: {
              candidate_id: application.candidate_id,
              topic_id: prepTopic.id,
              mcq_score: null,
              written_resp: null,
              progress_pct: 0,
              completed: false,
              updated_at: new Date()
            }
          });
        }
      }

      return interview;
    });

    // Notify candidate in real-time
    if (application.candidates && application.candidates.user_id) {
      const companyName = application.jobs?.companies?.name || 'Recruiter';
      const jobTitle = application.jobs?.title || 'Position';

      const formattedDate = new Date(interviewDate).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const scheduleMsg = `Your interview for ${jobTitle} at ${companyName} has been scheduled on ${formattedDate} at ${interviewTime}.`;
      await sendRealTimeNotification(application.candidates.user_id, scheduleMsg);

      if (preparationTopics && preparationTopics.length > 0) {
        const topicsMsg = `New interview preparation topics (${preparationTopics.join(', ')}) have been assigned for your upcoming ${interviewRound} interview.`;
        await sendRealTimeNotification(application.candidates.user_id, topicsMsg);
      }
    }

    return res.status(200).json(scheduled);
  } catch (error) {
    next(error);
  }
};

// 2. Retrieve Interviews for Company
export const getCompanyInterviews = async (req, res, next) => {
  try {
    const company = await prisma.companies.findUnique({
      where: { user_id: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const interviewsList = await prisma.interviews.findMany({
      where: {
        applications: {
          jobs: { company_id: company.id }
        }
      },
      include: {
        applications: {
          include: {
            candidates: true,
            jobs: true
          }
        }
      },
      orderBy: { interview_date: 'asc' }
    });

    return res.status(200).json(interviewsList);
  } catch (error) {
    next(error);
  }
};

// 3. Retrieve Interviews for Candidate
export const getCandidateInterviews = async (req, res, next) => {
  try {
    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    const interviewsList = await prisma.interviews.findMany({
      where: {
        applications: { candidate_id: candidate.id }
      },
      include: {
        applications: {
          include: {
            jobs: { include: { companies: true } }
          }
        }
      },
      orderBy: { interview_date: 'asc' }
    });

    return res.status(200).json(interviewsList);
  } catch (error) {
    next(error);
  }
};

// 4. Update Interview Status (Applicant: Accept, Reject, Reschedule)
export const updateInterviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rescheduleReason } = req.body;

    const interview = await prisma.interviews.findUnique({
      where: { id: BigInt(id) }
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }

    const updated = await prisma.interviews.update({
      where: { id: BigInt(id) },
      data: {
        status,
        reschedule_reason: rescheduleReason || null,
        updated_at: new Date()
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// 5. Generate Mock Interview Questions (20 Questions based on Skills, JD, Resume)
export const generateMockQuestions = async (req, res, next) => {
  try {
    const { skills, jobTitle, jobDescription } = req.body;

    const skillList = Array.isArray(skills) ? skills : (skills ? skills.split(', ') : ['Java', 'JavaScript', 'SQL']);
    const title = jobTitle || 'Full Stack Engineer';

    // Simulated AI 20 Question Generation
    const questions = [
      // Technical Questions (10)
      { id: 1, type: 'Technical', question: `Explain how you would handle asynchronous data mapping and lifecycle states in a project using ${skillList[0] || 'your core stack'}.` },
      { id: 2, type: 'Technical', question: `What are the key differences between SQL and NoSQL databases, and how does that influence caching in ${skillList[1] || 'your stack'}?` },
      { id: 3, type: 'Technical', question: `Explain the virtual DOM concept or backend execution lifecycle, and how optimization is achieved in production.` },
      { id: 4, type: 'Technical', question: `How would you architect a secure JWT authorization pipeline between a Node express framework and client state cookies?` },
      { id: 5, type: 'Technical', question: `Describe how you deploy cloud-resilient applications using Docker/Kubernetes container orchestrators.` },
      { id: 6, type: 'Technical', question: `What is the significance of transaction isolations, and how do you prevent deadlocks in PostgreSQL database transactions?` },
      { id: 7, type: 'Technical', question: `Explain microservices service-discovery patterns and how API gateways routing operates.` },
      { id: 8, type: 'Technical', question: `How do you write clean unit tests, and what strategies do you employ to mock database repository layers?` },
      { id: 9, type: 'Technical', question: `What is CORS, and how do you configure safe access headers in full-stack applications?` },
      { id: 10, type: 'Technical', question: `Describe memory leak debugging methods in frontend browser environments or backend service engines.` },

      // Project & Practical Questions (5)
      { id: 11, type: 'Project', question: `Tell me about a challenging full-stack project you engineered. What technical debts did you resolve?` },
      { id: 12, type: 'Project', question: `How did you design database schemas for data indexing efficiency in your personal projects?` },
      { id: 13, type: 'Project', question: `Describe your experience setting up CI/CD pipelines. How do you automate linting and test releases?` },
      { id: 14, type: 'Project', question: `How do you manage cross-team API contract alignment between frontend designers and backend developers?` },
      { id: 15, type: 'Project', question: `Tell me about a time you optimized a website loading speed by 25% or more. What tools did you use?` },

      // Behavioral & Leadership Questions (5)
      { id: 16, type: 'Behavioral', question: `Describe a conflict you had with a team lead or colleague. How did you align to reach a solution?` },
      { id: 17, type: 'Behavioral', question: `How do you prioritize multiple tasks under tight deadlines in Agile Scrum iterations?` },
      { id: 18, type: 'Behavioral', question: `What is your approach to learning a completely new technical stack or deployment tool?` },
      { id: 19, type: 'Behavioral', question: `Tell me about a time you noticed an engineering bug in production. How did you react and document it?` },
      { id: 20, type: 'Behavioral', question: `Where do you see yourself technically in the next 3 years? Are you aiming for technical leadership or architecture?` }
    ];

    return res.status(200).json({ questions });
  } catch (error) {
    next(error);
  }
};

// 6. Submit Mock Answer (Evaluates an individual answer)
export const submitMockAnswer = async (req, res, next) => {
  try {
    const { question, answer } = req.body;

    if (!answer || answer.trim() === '') {
      return res.status(400).json({ message: 'Answer text is required.' });
    }

    // Context-aware evaluation (simulate LLM)
    const len = answer.trim().split(/\s+/).length;
    let techScore = 60 + Math.floor(Math.random() * 15);
    let commScore = 70 + Math.floor(Math.random() * 15);
    let confScore = 65 + Math.floor(Math.random() * 20);
    let feedback = 'Good attempt. Consider explaining the core architectural concept more explicitly.';

    if (len > 35) {
      techScore += 10;
      commScore += 8;
      feedback = 'Solid, comprehensive answer. You successfully incorporated industry action keywords and described practical experience.';
    } else if (len < 10) {
      techScore -= 15;
      commScore -= 15;
      confScore -= 10;
      feedback = 'Answer is too brief. Try to structure your response using the STAR method (Situation, Task, Action, Result).';
    }

    // Keep scores capped
    techScore = Math.min(100, Math.max(30, techScore));
    commScore = Math.min(100, Math.max(30, commScore));
    confScore = Math.min(100, Math.max(30, confScore));

    return res.status(200).json({
      evaluation: {
        technicalScore: techScore,
        communicationScore: commScore,
        confidenceScore: confScore,
        feedbackSuggestions: feedback
      }
    });
  } catch (error) {
    next(error);
  }
};

// 7. Evaluate Mock Interview (Final Overall predictions)
export const evaluateMockInterview = async (req, res, next) => {
  try {
    const { answers } = req.body; // Array of { questionId, type, score }

    const defaultAnswers = answers || [];
    let technicalSum = 0;
    let communicationSum = 0;
    let confidenceSum = 0;

    if (defaultAnswers.length > 0) {
      defaultAnswers.forEach(ans => {
        technicalSum += ans.technicalScore || 75;
        communicationSum += ans.communicationScore || 78;
        confidenceSum += ans.confidenceScore || 80;
      });
      technicalSum = Math.round(technicalSum / defaultAnswers.length);
      communicationSum = Math.round(communicationSum / defaultAnswers.length);
      confidenceSum = Math.round(confidenceSum / defaultAnswers.length);
    } else {
      technicalSum = 72;
      communicationSum = 78;
      confidenceSum = 74;
    }

    const readinessScore = Math.round((technicalSum * 0.45) + (communicationSum * 0.35) + (confidenceSum * 0.20));

    const technicalReadiness = Math.round(technicalSum);
    const communicationReadiness = Math.round(communicationSum);
    const projectReadiness = Math.min(100, Math.round(readinessScore + (Math.random() * 6 - 3)));
    const leadershipReadiness = Math.min(100, Math.round(confidenceSum + (Math.random() * 8 - 4)));

    const weakAreas = [
      'Needs deeper focus on transactional isolates and concurrency deadlocks.',
      'Could improve confidence structure when describing cloud deployment architectures (Docker/Kubernetes).'
    ];

    const preparationRoadmap = [
      { step: 1, duration: 'Day 1-2', topic: 'Review core OOP, design principles, and transactional isolation layers.' },
      { step: 2, duration: 'Day 3-4', topic: 'Study container configurations, docker volumes, and deployment scripts.' },
      { step: 3, duration: 'Day 5', topic: 'Practice behavioral scenarios using the STAR structure for technical hurdles.' }
    ];

    return res.status(200).json({
      readinessScore,
      technicalReadiness,
      communicationReadiness,
      projectReadiness,
      leadershipReadiness,
      weakAreas,
      preparationRoadmap
    });
  } catch (error) {
    next(error);
  }
};

// 8. Company-specific Prep Guides (TCS, Infosys, Zoho)
export const getCompanySpecificPrep = async (req, res, next) => {
  try {
    const { companyName } = req.params;
    const cleanCompany = (companyName || '').toLowerCase();

    let details = {
      company: 'TCS',
      difficulty: 'Medium',
      focusAreas: ['Core Java / OOPs concepts', 'SQL Query tuning & joins', 'Data Structures (Arrays, Lists)', 'Behavioral / Customer-facing mindset'],
      rounds: '1. Online Aptitude, 2. Technical Round (Concepts & simple coding), 3. MR/HR Round',
      interviewTips: 'Emphasize strong fundamental concepts. Review service class designs and database index methodologies. Be polite, clear, and highlight team achievements.'
    };

    if (cleanCompany.includes('infosys')) {
      details = {
        company: 'Infosys',
        difficulty: 'Medium',
        focusAreas: ['System design & architecture basics', 'Full stack REST mappings', 'JavaScript/React lifecycle properties', 'Database normalizations'],
        rounds: '1. InfyTQ Coding / Aptitude Test, 2. Core Technical Screening, 3. HR Funnel',
        interviewTips: 'Focus on coding paradigms and project workflows. Be prepared to explain exactly how you constructed database relationships and APIs in your projects.'
      };
    } else if (cleanCompany.includes('zoho')) {
      details = {
        company: 'Zoho',
        difficulty: 'Hard (Coding focused)',
        focusAreas: ['Pure algorithmic problem solving (No external libraries)', 'Object Oriented System Design (e.g. Design Railway booking)', 'Multi-threaded execution', 'Refactoring complex logic'],
        rounds: '1. Round 1 (Written/Online Coding), 2. Round 2 (Advanced Algorithm Debugging), 3. Round 3 (L3 System Design), 4. HR Interview',
        interviewTips: 'Zoho focuses heavily on your custom coding skills and design logic. Practice designing complete standalone command-line applications (like a parking lot system) from scratch.'
      };
    }

    return res.status(200).json(details);
  } catch (error) {
    next(error);
  }
};

// 9. Fetch Candidate Assigned Prep Topics with Progress
export const getAssignedPrepTopics = async (req, res, next) => {
  try {
    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }

    const progresses = await prisma.preparation_progresses.findMany({
      where: { candidate_id: candidate.id },
      include: {
        topic: {
          include: {
            interviews: {
              include: {
                applications: {
                  include: {
                    jobs: { include: { companies: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Map into user-friendly structure
    const results = progresses.map(p => ({
      id: Number(p.id),
      topicId: Number(p.topic_id),
      topicName: p.topic.name,
      mcqScore: p.mcq_score,
      writtenResp: p.written_resp ? JSON.parse(p.written_resp) : null,
      progressPct: p.progress_pct,
      completed: p.completed,
      interviewDate: p.topic.interviews?.interview_date,
      interviewRound: p.topic.interviews?.interview_round,
      companyName: p.topic.interviews?.applications?.jobs?.companies?.name || 'Recruiter'
    }));

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

// 10. Fetch Topic Theory
export const getTopicTheory = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const topic = await prisma.interview_preparation_topics.findUnique({
      where: { id: BigInt(topicId) }
    });

    if (!topic) {
      return res.status(404).json({ message: 'Preparation topic not found' });
    }

    // Dynamic theory content based on topic name
    const theoryContent = {
      topicName: topic.name,
      explanation: `Detailed concepts study guide for ${topic.name}. Focuses on core structures, architectural constraints, and standard optimization models.`,
      keyConcepts: [
        `Syntax and structural semantics of ${topic.name}`,
        `Memory management, stack-heap distribution, and garbage collection paradigms where applicable.`,
        `Concurrency, thread safety, and resource locking mechanisms.`,
        `Integration boundaries, service APIs, and performance scaling.`
      ],
      interviewQuestions: [
        { q: `What is the primary architectural style supported by ${topic.name}?`, a: 'Depends on scope; primarily follows modular execution pipelines.' },
        { q: `Explain the memory allocation footprint in ${topic.name}.`, a: 'Analyzed using static code allocation indexes and runtime profiling logs.' },
        { q: `How do you avoid concurrency lock conflicts in ${topic.name}?`, a: 'Leveraging optimistic locking, immutable data states, and synchronized handlers.' }
      ]
    };

    return res.status(200).json(theoryContent);
  } catch (error) {
    next(error);
  }
};

// 11. Fetch Randomized MCQs
export const getTopicMCQs = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const topic = await prisma.interview_preparation_topics.findUnique({
      where: { id: BigInt(topicId) }
    });

    if (!topic) {
      return res.status(404).json({ message: 'Preparation topic not found' });
    }

    const mcqs = await prisma.mcq_questions.findMany({
      where: { topic_name: topic.name }
    });

    // Randomize list
    const randomized = mcqs.sort(() => 0.5 - Math.random()).slice(0, 5).map(m => ({
      id: Number(m.id),
      question: m.question,
      options: JSON.parse(m.options)
    }));

    return res.status(200).json(randomized);
  } catch (error) {
    next(error);
  }
};

// 12. Submit MCQ Answers
export const submitTopicMCQs = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { answers } = req.body; // Map: questionId (Number) -> selectedOptionIndex (Number)

    const topic = await prisma.interview_preparation_topics.findUnique({
      where: { id: BigInt(topicId) }
    });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    // Evaluate answers
    let correctCount = 0;
    const qIds = Object.keys(answers).map(id => BigInt(id));
    const questionsList = await prisma.mcq_questions.findMany({
      where: { id: { in: qIds } }
    });

    questionsList.forEach(q => {
      const selected = answers[q.id.toString()];
      if (selected === q.correct_option) {
        correctCount++;
      }
    });

    const scorePct = questionsList.length > 0 ? Math.round((correctCount / questionsList.length) * 100) : 0;

    // Fetch active progress
    const progress = await prisma.preparation_progresses.findFirst({
      where: { candidate_id: candidate.id, topic_id: BigInt(topicId) }
    });

    const currentWritten = progress?.written_resp;
    const currentCompleted = progress?.completed || false;

    // Calculate new progress pct: MCQs complete is 50%, Written complete is 50%
    let newProgressPct = 50;
    if (currentWritten) newProgressPct = 100;

    await prisma.preparation_progresses.update({
      where: { id: progress.id },
      data: {
        mcq_score: scorePct,
        progress_pct: newProgressPct,
        completed: newProgressPct === 100 ? true : currentCompleted,
        updated_at: new Date()
      }
    });

    return res.status(200).json({ score: scorePct, correctCount, total: questionsList.length });
  } catch (error) {
    next(error);
  }
};

// 13. Fetch Written Questions
export const getTopicWritten = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const topic = await prisma.interview_preparation_topics.findUnique({
      where: { id: BigInt(topicId) }
    });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const questionsList = await prisma.written_questions.findMany({
      where: { topic_name: topic.name }
    });

    const results = questionsList.slice(0, 3).map(q => ({
      id: Number(q.id),
      question: q.question,
      suggestedAnswer: q.suggested_answer
    }));

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

// 14. Submit Written Responses
export const submitTopicWritten = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { responses } = req.body; // Map: questionId (Number) -> answer text (String)

    const topic = await prisma.interview_preparation_topics.findUnique({
      where: { id: BigInt(topicId) },
      include: {
        interviews: {
          include: {
            applications: {
              include: {
                jobs: {
                  include: {
                    companies: {
                      include: { users: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const candidate = await prisma.candidates.findUnique({
      where: { user_id: req.user.id }
    });

    const progress = await prisma.preparation_progresses.findFirst({
      where: { candidate_id: candidate.id, topic_id: BigInt(topicId) }
    });

    const hasMcq = progress?.mcq_score !== null;
    let newProgressPct = 50;
    if (hasMcq) newProgressPct = 100;

    await prisma.preparation_progresses.update({
      where: { id: progress.id },
      data: {
        written_resp: JSON.stringify(responses),
        progress_pct: newProgressPct,
        completed: true,
        updated_at: new Date()
      }
    });

    // Notify recruiter that candidate completed preparation!
    const companyUserId = topic.interviews?.applications?.jobs?.companies?.user_id;
    if (companyUserId) {
      const candidateName = `${candidate.first_name} ${candidate.last_name}`;
      const alertMsg = `Candidate ${candidateName} has submitted interview preparation tasks for ${topic.name}.`;
      await sendRealTimeNotification(companyUserId, alertMsg);
    }

    return res.status(200).json({ message: 'Written responses submitted successfully', progress: newProgressPct });
  } catch (error) {
    next(error);
  }
};

// 15. Fetch Mock Questions
export const getTopicMocks = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const topic = await prisma.interview_preparation_topics.findUnique({
      where: { id: BigInt(topicId) }
    });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Generate 5 random mock questions
    const mocks = [
      `Design a scalable database schema to handle comments for topic ${topic.name}.`,
      `Explain a major performance bottleneck you encountered while scaling a ${topic.name} service.`,
      `Describe security best practices for production deployment of ${topic.name} structures.`,
      `How does garbage collection or memory mapping affect concurrency execution in ${topic.name}?`,
      `Describe how you would debug a slow API endpoint relying on ${topic.name}.`
    ];

    return res.status(200).json(mocks);
  } catch (error) {
    next(error);
  }
};

