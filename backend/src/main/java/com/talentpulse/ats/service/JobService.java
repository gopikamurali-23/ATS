package com.talentpulse.ats.service;

import com.talentpulse.ats.model.Job;
import com.talentpulse.ats.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public List<Job> getAllActiveJobs() {
        return jobRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    public List<Job> getJobsByCompany(String companyName) {
        return jobRepository.findByCompanyNameOrderByCreatedAtDesc(companyName);
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public Job updateJob(Long id, Job updatedJob) {
        Job existing = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        existing.setTitle(updatedJob.getTitle());
        existing.setDescription(updatedJob.getDescription());
        existing.setLocation(updatedJob.getLocation());
        existing.setEmploymentType(updatedJob.getEmploymentType());
        existing.setRequiredExperienceYears(updatedJob.getRequiredExperienceYears());
        existing.setRequiredSkills(updatedJob.getRequiredSkills());
        existing.setSalaryRange(updatedJob.getSalaryRange());
        if (updatedJob.getActive() != null) {
            existing.setActive(updatedJob.getActive());
        }
        return jobRepository.save(existing);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }
}
