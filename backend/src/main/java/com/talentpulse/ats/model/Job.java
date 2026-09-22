package com.talentpulse.ats.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000, nullable = false)
    private String description;

    @Column(nullable = false)
    private String companyName;

    private String location;

    private String employmentType; // Full-Time, Part-Time, Remote, Contract

    private Integer requiredExperienceYears;

    @Column(length = 1000)
    private String requiredSkills; // Comma separated list of skills

    private String salaryRange;

    private Boolean active = true;

    private LocalDateTime createdAt;

    public Job() {
        this.createdAt = LocalDateTime.now();
    }

    public Job(String title, String description, String companyName, String location, String employmentType, Integer requiredExperienceYears, String requiredSkills, String salaryRange) {
        this.title = title;
        this.description = description;
        this.companyName = companyName;
        this.location = location;
        this.employmentType = employmentType;
        this.requiredExperienceYears = requiredExperienceYears;
        this.requiredSkills = requiredSkills;
        this.salaryRange = salaryRange;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public Integer getRequiredExperienceYears() {
        return requiredExperienceYears;
    }

    public void setRequiredExperienceYears(Integer requiredExperienceYears) {
        this.requiredExperienceYears = requiredExperienceYears;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
