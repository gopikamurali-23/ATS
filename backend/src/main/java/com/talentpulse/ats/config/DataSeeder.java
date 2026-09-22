package com.talentpulse.ats.config;

import com.talentpulse.ats.model.*;
import com.talentpulse.ats.repository.ApplicationRepository;
import com.talentpulse.ats.repository.JobRepository;
import com.talentpulse.ats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        // 1. Seed Demo Accounts
        User john = new User("john_doe", passwordEncoder.encode("john123"), "john.doe@example.com", Role.ROLE_CANDIDATE, "John Doe", null);
        User alice = new User("alice_smith", passwordEncoder.encode("alice123"), "alice.smith@example.com", Role.ROLE_CANDIDATE, "Alice Smith", null);
        User bob = new User("bob_jones", passwordEncoder.encode("bob123"), "bob.jones@example.com", Role.ROLE_CANDIDATE, "Bob Jones", null);

        User google = new User("google", passwordEncoder.encode("google123"), "careers@google.com", Role.ROLE_COMPANY, "Google Recruiter", "Google");
        User microsoft = new User("microsoft", passwordEncoder.encode("microsoft123"), "careers@microsoft.com", Role.ROLE_COMPANY, "Microsoft HR", "Microsoft");

        User admin = new User("admin", passwordEncoder.encode("admin123"), "admin@talentpulse.io", Role.ROLE_ADMIN, "Platform Administrator", "TalentPulse HQ");

        userRepository.saveAll(List.of(john, alice, bob, google, microsoft, admin));

        // 2. Seed Jobs
        Job job1 = new Job(
                "Senior Java Backend Engineer",
                "We are seeking a Senior Java Engineer to build high-performance microservices. Minimum 5 years of experience with Spring Boot, PostgreSQL, Docker, and REST APIs required.",
                "Google",
                "Mountain View, CA (Hybrid)",
                "Full-Time",
                5,
                "Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git",
                "$140,000 - $180,000"
        );

        Job job2 = new Job(
                "Lead React Frontend Developer",
                "Join Google's core frontend UI team. Design responsive dashboard interfaces using React, TypeScript, Tailwind CSS, and state management frameworks.",
                "Google",
                "Remote",
                "Full-Time",
                4,
                "React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, REST API",
                "$130,000 - $165,000"
        );

        Job job3 = new Job(
                "Cloud DevOps & Platform Engineer",
                "Manage Kubernetes clusters, CI/CD pipelines, Terraform infrastructure, and AWS cloud environments for enterprise applications.",
                "Microsoft",
                "Redmond, WA",
                "Full-Time",
                3,
                "AWS, Docker, Kubernetes, CI/CD, Jenkins, Linux, Python, Git",
                "$125,000 - $155,000"
        );

        Job job4 = new Job(
                "Full Stack Engineer (Java + React)",
                "Build end-to-end features using Java Spring Boot on the backend and React on the frontend.",
                "Google",
                "New York, NY",
                "Full-Time",
                3,
                "Java, Spring Boot, React, JavaScript, SQL, PostgreSQL, REST API",
                "$120,000 - $150,000"
        );

        jobRepository.saveAll(List.of(job1, job2, job3, job4));

        // 3. Seed Applications with ATS Fit Scores
        Application app1 = new Application(
                job1,
                john,
                ApplicationStatus.INTERVIEWING,
                92,
                6,
                "Bachelor of Technology in Computer Science",
                "Java, Spring Boot, Spring Data JPA, Microservices, PostgreSQL, Docker, REST API, Git, SQL",
                "",
                "John_Doe_Senior_Java_Resume.pdf",
                "John Doe. 6+ years experienced Senior Java Developer proficient in Spring Boot, Microservices, PostgreSQL, Docker, REST API, Git."
        );

        Application app2 = new Application(
                job2,
                alice,
                ApplicationStatus.OFFERED,
                95,
                5,
                "Bachelor of Science in Information Technology",
                "React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, REST API",
                "",
                "Alice_Smith_Lead_React_Resume.pdf",
                "Alice Smith. Lead Frontend Engineer with 5 years experience building complex React and TypeScript UIs."
        );

        Application app3 = new Application(
                job1,
                bob,
                ApplicationStatus.UNDER_REVIEW,
                78,
                3,
                "Bachelor of Engineering",
                "Java, Spring Boot, REST API, Git, SQL",
                "Microservices, PostgreSQL, Docker",
                "Bob_Jones_Resume.pdf",
                "Bob Jones. Java Developer with 3 years of software engineering experience."
        );

        Application app4 = new Application(
                job3,
                john,
                ApplicationStatus.APPLIED,
                85,
                6,
                "Bachelor of Technology in Computer Science",
                "Docker, AWS, Linux, Python, Git, CI/CD",
                "Kubernetes, Jenkins",
                "John_Doe_DevOps_Resume.pdf",
                "John Doe. Experienced with Docker, AWS, Linux, Python and CI/CD pipelines."
        );

        applicationRepository.saveAll(List.of(app1, app2, app3, app4));

        System.out.println(">>> TalentPulse database successfully seeded with Demo Accounts, Jobs, and Applications!");
    }
}
