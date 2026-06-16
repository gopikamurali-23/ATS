import prisma from './db.js';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    const userCount = await prisma.users.count();
    if (userCount > 0) {
      console.log('Database already has users, checking for missing prep questions...');
      await seedPrepQuestions();
      await seedDefaultApplications();
      return;
    }

    console.log('Seeding database with default records...');

    // 1. Seed Admin
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    await prisma.users.create({
      data: {
        username: 'admin',
        password: adminPasswordHash,
        email: 'admin@ats.com',
        role: 'ROLE_ADMIN',
      },
    });

    // 2. Seed Company User & Company Profile
    const companyPasswordHash = bcrypt.hashSync('google123', 10);
    const companyUser = await prisma.users.create({
      data: {
        username: 'google',
        password: companyPasswordHash,
        email: 'jobs@google.com',
        role: 'ROLE_COMPANY',
      },
    });

    await prisma.companies.create({
      data: {
        user_id: companyUser.id,
        name: 'Google LLC',
        description: 'Search engine and AI pioneer',
        industry: 'Technology',
        location: 'Mountain View, CA',
        website: 'https://google.com',
      },
    });

    // 3. Seed Candidate User & Candidate Profile
    const candidatePasswordHash = bcrypt.hashSync('john123', 10);
    const candidateUser = await prisma.users.create({
      data: {
        username: 'john_doe',
        password: candidatePasswordHash,
        email: 'john.doe@gmail.com',
        role: 'ROLE_CANDIDATE',
      },
    });

    const candidate = await prisma.candidates.create({
      data: {
        user_id: candidateUser.id,
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1-555-0199',
        title: 'Full Stack Developer',
      },
    });

    // Seed candidate skills
    const skills = ['Java', 'Spring Boot', 'React', 'SQL', 'Git'];
    for (const skill of skills) {
      await prisma.candidate_skills.create({
        data: {
          candidate_id: candidate.id,
          skill: skill,
        },
      });
    }

    // Seed candidate education
    const educations = ['Bachelor of Science in Computer Science - Stanford University'];
    for (const edu of educations) {
      await prisma.candidate_education.create({
        data: {
          candidate_id: candidate.id,
          education_entry: edu,
        },
      });
    }

    // Seed candidate experience
    const experiences = ['Software Engineer Intern - Google', 'Junior Developer - Acme Corp'];
    for (const exp of experiences) {
      await prisma.candidate_experience.create({
        data: {
          candidate_id: candidate.id,
          experience_entry: exp,
        },
      });
    }

    await seedPrepQuestions();
    await seedDefaultApplications();

    console.log('Dummy Database Seeded Successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

const seedPrepQuestions = async () => {
  const mcqCount = await prisma.mcq_questions.count();
  if (mcqCount === 0) {
    console.log('Seeding MCQ questions...');
    const mcqData = [
      // Java
      { topic_name: 'Java', question: 'Which of the following is NOT a fundamental feature of OOP in Java?', options: JSON.stringify(['Inheritance', 'Encapsulation', 'Polymorphism', 'Compilation']), correct_option: 3 },
      { topic_name: 'Java', question: 'What is the memory area in Java where objects are allocated?', options: JSON.stringify(['Stack', 'Heap', 'Register', 'Segment']), correct_option: 1 },
      { topic_name: 'Java', question: 'Which class is the ultimate superclass of all classes in Java?', options: JSON.stringify(['Class', 'Object', 'String', 'System']), correct_option: 1 },
      // Spring Boot
      { topic_name: 'Spring Boot', question: 'Which annotation is used to mark a class as a REST controller in Spring Boot?', options: JSON.stringify(['@Controller', '@RestController', '@Service', '@Repository']), correct_option: 1 },
      { topic_name: 'Spring Boot', question: 'Which Spring Boot starter dependency is used for database connection and JPA support?', options: JSON.stringify(['spring-boot-starter-web', 'spring-boot-starter-data-jpa', 'spring-boot-starter-jdbc', 'spring-boot-starter-test']), correct_option: 1 },
      { topic_name: 'Spring Boot', question: 'Where are application properties typically defined in a Spring Boot application?', options: JSON.stringify(['web.xml', 'pom.xml', 'application.properties', 'SpringConfig.java']), correct_option: 2 },
      // React.js
      { topic_name: 'React.js', question: 'What hook is used to manage local state inside a functional component in React?', options: JSON.stringify(['useEffect', 'useState', 'useContext', 'useReducer']), correct_option: 1 },
      { topic_name: 'React.js', question: 'Which of the following is used to pass data down from parent to child components?', options: JSON.stringify(['Props', 'State', 'Context', 'Reducer']), correct_option: 0 },
      { topic_name: 'React.js', question: 'What is the purpose of React.memo?', options: JSON.stringify(['To memoize state updates', 'To cache API responses', 'To prevent unnecessary re-renders of a component', 'To manage global context']), correct_option: 2 },
      // SQL
      { topic_name: 'SQL', question: 'Which SQL clause is used to filter group results after aggregation?', options: JSON.stringify(['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY']), correct_option: 1 },
      { topic_name: 'SQL', question: 'Which join type returns all records from the left table and matching records from the right table?', options: JSON.stringify(['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN']), correct_option: 1 },
      { topic_name: 'SQL', question: 'What constraint uniquely identifies each record in a database table?', options: JSON.stringify(['FOREIGN KEY', 'UNIQUE KEY', 'PRIMARY KEY', 'CHECK']), correct_option: 2 },
      // Data Structures
      { topic_name: 'Data Structures', question: 'What is the worst-case time complexity of searching in a binary search tree (BST)?', options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)']), correct_option: 2 },
      { topic_name: 'Data Structures', question: 'Which data structure operates on a Last-In, First-Out (LIFO) model?', options: JSON.stringify(['Queue', 'Stack', 'Linked List', 'Graph']), correct_option: 1 },
      { topic_name: 'Data Structures', question: 'What is the time complexity to insert an element at the beginning of a singly linked list?', options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n^2)']), correct_option: 0 },
      // System Design
      { topic_name: 'System Design', question: 'Which caching strategy writes data directly to the cache and the backend store simultaneously?', options: JSON.stringify(['Write-Through', 'Write-Around', 'Write-Back', 'Cache-Aside']), correct_option: 0 },
      { topic_name: 'System Design', question: 'What index mechanism is commonly used to distribute network traffic evenly across backend servers?', options: JSON.stringify(['DNS resolver', 'Reverse Proxy', 'Load Balancer', 'API Gateway']), correct_option: 2 },
      { topic_name: 'System Design', question: 'Which concept explains that a distributed system can only guarantee two out of Consistency, Availability, and Partition tolerance?', options: JSON.stringify(['ACID Theorem', 'CAP Theorem', 'BASE Theorem', 'SOLID Principles']), correct_option: 1 }
    ];

    for (const mcq of mcqData) {
      await prisma.mcq_questions.create({ data: mcq });
    }
  }

  const writtenCount = await prisma.written_questions.count();
  if (writtenCount === 0) {
    console.log('Seeding Written questions...');
    const writtenData = [
      // Java
      { topic_name: 'Java', question: 'Explain the difference between interface and abstract class in Java, and when to use which.', suggested_answer: 'Interfaces define contracts (can have multiple inheritance), while Abstract Classes provide base functionality and state (single inheritance).' },
      { topic_name: 'Java', question: 'What is Garbage Collection in Java, and how do JVM memory generations (Young, Old, Metaspace) work?', suggested_answer: 'Garbage Collection automates memory management by clearing unreferenced objects. Memory is divided into Young generation (Eden/Survivor), Old generation (long-lived), and Metaspace.' },
      // Spring Boot
      { topic_name: 'Spring Boot', question: 'Describe the Spring Bean lifecycle and explain dependency injection types.', suggested_answer: 'bean instantiation -> populate properties -> setBeanName -> postProcessBeforeInitialization -> initMethod -> postProcessAfterInitialization -> destruction. Injection can be Constructor, Setter, or Field.' },
      { topic_name: 'Spring Boot', question: 'How does Spring Boot Auto-Configuration work under the hood?', suggested_answer: 'Spring Boot scans classpath dependencies and automatically registers beans using @EnableAutoConfiguration and @Conditional annotations.' },
      // React.js
      { topic_name: 'React.js', question: 'Explain the virtual DOM execution lifecycle and list key rendering optimization strategies.', suggested_answer: 'React creates in-memory DOM representation, diffs it with actual DOM (reconciliation), and updates only modified elements. Optimization includes key prop, React.memo, useMemo, useCallback.' },
      { topic_name: 'React.js', question: 'Describe React Context API vs Redux for global state management.', suggested_answer: 'Context is built-in for low-frequency updates (themes, locales), whereas Redux is suited for complex state management with high-frequency updates and action-driven debugging.' },
      // SQL
      { topic_name: 'SQL', question: 'Explain database index indexing types (B-Tree, Hash) and explain index tuning optimization.', suggested_answer: 'B-Tree is structured for range queries; Hash index is built for point lookups. Tuning involves query analysis, avoiding select *, indexing filter keys, and using explain plan.' },
      { topic_name: 'SQL', question: 'What are ACID properties in SQL transactions, and how are they maintained by database isolation levels?', suggested_answer: 'Atomicity, Consistency, Isolation, Durability. Isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) manage transaction concurrency.' },
      // Data Structures
      { topic_name: 'Data Structures', question: 'Explain how to detect a loop in a Singly Linked List using Floyd\'s Cycle-Finding Algorithm.', suggested_answer: 'Floyd\'s algorithm uses two pointers: slow pointer moving one node at a time, fast pointer moving two. If a cycle exists, they will eventually meet.' },
      { topic_name: 'Data Structures', question: 'Describe the differences between DFS and BFS, and explain their practical graph routing applications.', suggested_answer: 'DFS uses stack (reaches deep first) for puzzle solving or connectivity; BFS uses queue (explores breadth first) for finding shortest path in unweighted graphs.' },
      // System Design
      { topic_name: 'System Design', question: 'How would you design a scalable notification service that handles millions of active devices?', suggested_answer: 'Use pub-sub messaging queues (Kafka/RabbitMQ), rate limiters, push notification gateways (APNs/FCM), partition database records, and horizontal scaling of worker nodes.' },
      { topic_name: 'System Design', question: 'Explain the differences between Monolithic and Microservices architectures, and describe API Gateway routing patterns.', suggested_answer: 'Monolith is a single deployable unit; Microservices break it into independent domain services. API Gateway handles authorization, rate limiting, and request routing/aggregation.' }
    ];

    for (const written of writtenData) {
      await prisma.written_questions.create({ data: written });
    }
  }
};

const seedDefaultApplications = async () => {
  try {
    const company = await prisma.companies.findFirst();
    const candidate = await prisma.candidates.findFirst();

    if (company && candidate) {
      const jobCount = await prisma.jobs.count();
      let job = await prisma.jobs.findFirst();
      if (jobCount === 0 || !job) {
        console.log('Seeding default job vacancy...');
        job = await prisma.jobs.create({
          data: {
            title: 'Software Engineer',
            description: 'We are looking for a Software Engineer with expertise in Java, Spring Boot, React, and SQL. You will build and scale reliable web systems.',
            experience_required_years: 2,
            salary_range: '$120k - $150k',
            location: 'Mountain View, CA',
            status: 'OPEN',
            company_id: company.id,
            job_skills: {
              create: [
                { skill: 'React' },
                { skill: 'Java' },
                { skill: 'Spring Boot' },
                { skill: 'SQL' }
              ]
            },
            job_keywords: {
              create: [
                { keyword: 'React' },
                { keyword: 'Java' },
                { keyword: 'Spring Boot' },
                { keyword: 'SQL' },
                { keyword: 'REST API' }
              ]
            }
          }
        });
      }

      const appCount = await prisma.applications.count();
      if (appCount === 0) {
        console.log('Seeding default application and ATS result...');
        const app = await prisma.applications.create({
          data: {
            applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'SHORTLISTED',
            candidate_id: candidate.id,
            job_id: job.id,
            resume_text: 'John Doe Software Engineer. Experience: React, Java, SQL. Education: Stanford University.'
          }
        });

        await prisma.ats_results.create({
          data: {
            application_id: app.id,
            analyzed_at: new Date(),
            final_ats_score: 85.0,
            skill_match_score: 90.0,
            experience_match_score: 80.0,
            education_match_score: 100.0,
            keyword_match_score: 75.0,
            format_match_score: 90.0,
            project_match_score: 85.0,
            certification_match_score: 80.0,
            communication_match_score: 85.0,
            candidate_summary: 'John Doe is a highly competent Software Engineer with 2+ years of experience specializing in React, Spring Boot, and database management. His background aligns exceptionally well with the frontend engineering requirements.',
            missing_skills: 'TypeScript, GraphQL, Docker',
            strengths: 'Strong frontend architecture experience. Solid React and state management skills. Great academic background from Stanford.',
            weaknesses: 'Lacks microservices backend exposure. Missing direct cloud deployment experience.',
            improvement_suggestions: 'Add TypeScript project experience to the resume. Highlight cloud deployments (AWS/GCP). Specify REST API testing frameworks used.',
            interview_success_probability: 85.0,
            hiring_success_probability: 75.0
          }
        });
      }
    }
  } catch (err) {
    console.error('Error seeding default applications:', err);
  }
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] && process.argv[1].endsWith('dbSeeder.js')) {
  seedDatabase()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
