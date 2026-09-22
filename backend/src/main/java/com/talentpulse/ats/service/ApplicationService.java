package com.talentpulse.ats.service;

import com.talentpulse.ats.dto.DashboardStatsDTO;
import com.talentpulse.ats.dto.ResumeParseResultDTO;
import com.talentpulse.ats.model.*;
import com.talentpulse.ats.repository.ApplicationRepository;
import com.talentpulse.ats.repository.JobRepository;
import com.talentpulse.ats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeParserService resumeParserService;

    public Application applyToJob(Long jobId, User candidate, MultipartFile resumeFile, String rawResumeText) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        String fileName = resumeFile != null && !resumeFile.isEmpty() ? resumeFile.getOriginalFilename() : "pasted_resume.txt";
        String contentText = resumeFile != null && !resumeFile.isEmpty()
                ? resumeParserService.extractTextFromFile(resumeFile)
                : (rawResumeText != null ? rawResumeText : "");

        ResumeParseResultDTO parseResult = resumeParserService.analyzeResume(fileName, contentText, job);

        String extractedSkillsStr = String.join(", ", parseResult.getExtractedSkills());
        String missingSkillsStr = String.join(", ", parseResult.getMissingSkills());

        Application application = new Application(
                job,
                candidate,
                ApplicationStatus.APPLIED,
                parseResult.getAtsMatchScore(),
                parseResult.getEstimatedExperienceYears(),
                parseResult.getExtractedEducation(),
                extractedSkillsStr,
                missingSkillsStr,
                fileName,
                contentText
        );

        return applicationRepository.save(application);
    }

    public List<Application> getCandidateApplications(Long candidateId) {
        return applicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidateId);
    }

    public List<Application> getRankedApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobIdOrderByMatchScoreDesc(jobId);
    }

    public List<Application> getCompanyApplications(String companyName) {
        return applicationRepository.findByJobCompanyNameOrderByAppliedAtDesc(companyName);
    }

    public Application updateStatus(Long applicationId, ApplicationStatus status) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(status);
        return applicationRepository.save(app);
    }

    public DashboardStatsDTO getDashboardStats() {
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long totalCandidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_CANDIDATE)
                .count();

        Double avgScore = applicationRepository.getAverageMatchScore();
        double roundAvg = avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0;

        List<Application> allApps = applicationRepository.findAll();

        Map<String, Long> statusCount = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusCount.put(status.name(), allApps.stream().filter(a -> a.getStatus() == status).count());
        }

        Map<String, Long> topSkills = new HashMap<>();
        allApps.forEach(app -> {
            if (app.getExtractedSkills() != null && !app.getExtractedSkills().isEmpty()) {
                Arrays.stream(app.getExtractedSkills().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .forEach(skill -> topSkills.put(skill, topSkills.getOrDefault(skill, 0L) + 1));
            }
        });

        // Sort & pick top 6 skills
        Map<String, Long> sortedTopSkills = topSkills.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        Map<String, Long> funnel = new LinkedHashMap<>();
        funnel.put("Total Applications", totalApplications);
        funnel.put("Under Review", statusCount.getOrDefault("UNDER_REVIEW", 0L));
        funnel.put("Interviewing", statusCount.getOrDefault("INTERVIEWING", 0L));
        funnel.put("Offered", statusCount.getOrDefault("OFFERED", 0L));

        return new DashboardStatsDTO(
                totalJobs,
                totalApplications,
                totalCandidates,
                roundAvg,
                statusCount,
                sortedTopSkills,
                funnel
        );
    }
}
