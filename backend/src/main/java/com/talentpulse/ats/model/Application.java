package com.talentpulse.ats.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private Integer matchScore; // 0 to 100 percentage

    private Integer estimatedExperienceYears;

    private String extractedEducation;

    @Column(length = 2000)
    private String extractedSkills;

    @Column(length = 2000)
    private String missingSkills;

    private String resumeFileName;

    @Column(length = 10000)
    private String resumeText;

    private LocalDateTime appliedAt;

    public Application() {
        this.appliedAt = LocalDateTime.now();
    }

    public Application(Job job, User candidate, ApplicationStatus status, Integer matchScore, Integer estimatedExperienceYears, String extractedEducation, String extractedSkills, String missingSkills, String resumeFileName, String resumeText) {
        this.job = job;
        this.candidate = candidate;
        this.status = status != null ? status : ApplicationStatus.APPLIED;
        this.matchScore = matchScore;
        this.estimatedExperienceYears = estimatedExperienceYears;
        this.extractedEducation = extractedEducation;
        this.extractedSkills = extractedSkills;
        this.missingSkills = missingSkills;
        this.resumeFileName = resumeFileName;
        this.resumeText = resumeText;
        this.appliedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public User getCandidate() {
        return candidate;
    }

    public void setCandidate(User candidate) {
        this.candidate = candidate;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public Integer getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Integer matchScore) {
        this.matchScore = matchScore;
    }

    public Integer getEstimatedExperienceYears() {
        return estimatedExperienceYears;
    }

    public void setEstimatedExperienceYears(Integer estimatedExperienceYears) {
        this.estimatedExperienceYears = estimatedExperienceYears;
    }

    public String getExtractedEducation() {
        return extractedEducation;
    }

    public void setExtractedEducation(String extractedEducation) {
        this.extractedEducation = extractedEducation;
    }

    public String getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(String extractedSkills) {
        this.extractedSkills = extractedSkills;
    }

    public String getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(String missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
}
