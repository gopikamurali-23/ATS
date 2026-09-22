package com.talentpulse.ats.controller;

import com.talentpulse.ats.dto.ResumeParseResultDTO;
import com.talentpulse.ats.model.Application;
import com.talentpulse.ats.model.ApplicationStatus;
import com.talentpulse.ats.model.Job;
import com.talentpulse.ats.model.User;
import com.talentpulse.ats.service.ApplicationService;
import com.talentpulse.ats.service.JobService;
import com.talentpulse.ats.service.ResumeParserService;
import com.talentpulse.ats.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserService userService;

    @Autowired
    private JobService jobService;

    @Autowired
    private ResumeParserService resumeParserService;

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Application> applyWithFile(
            @RequestParam("jobId") Long jobId,
            @RequestPart(value = "resumeFile", required = false) MultipartFile resumeFile,
            @RequestParam(value = "resumeText", required = false) String resumeText,
            Authentication authentication) {

        User candidate = userService.getByUsername(authentication.getName());
        Application application = applicationService.applyToJob(jobId, candidate, resumeFile, resumeText);
        return ResponseEntity.ok(application);
    }

    @PostMapping("/parse-resume")
    public ResponseEntity<ResumeParseResultDTO> parseResume(
            @RequestPart(value = "resumeFile", required = false) MultipartFile resumeFile,
            @RequestParam(value = "resumeText", required = false) String resumeText,
            @RequestParam(value = "jobId", required = false) Long jobId) {

        Job job = jobId != null ? jobService.getJobById(jobId).orElse(null) : null;
        String fileName = resumeFile != null && !resumeFile.isEmpty() ? resumeFile.getOriginalFilename() : "pasted_resume.txt";
        String extractedText = resumeFile != null && !resumeFile.isEmpty()
                ? resumeParserService.extractTextFromFile(resumeFile)
                : (resumeText != null ? resumeText : "");

        ResumeParseResultDTO result = resumeParserService.analyzeResume(fileName, extractedText, job);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Application>> getMyApplications(Authentication authentication) {
        User candidate = userService.getByUsername(authentication.getName());
        return ResponseEntity.ok(applicationService.getCandidateApplications(candidate.getId()));
    }

    @GetMapping("/job/{jobId}/ranked")
    @PreAuthorize("hasAuthority('ROLE_COMPANY') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Application>> getRankedApplicationsForJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getRankedApplicationsForJob(jobId));
    }

    @GetMapping("/company")
    @PreAuthorize("hasAuthority('ROLE_COMPANY') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Application>> getCompanyApplications(Authentication authentication) {
        User company = userService.getByUsername(authentication.getName());
        String companyName = company.getCompanyName() != null && !company.getCompanyName().isEmpty()
                ? company.getCompanyName()
                : "Google"; // fallback default
        return ResponseEntity.ok(applicationService.getCompanyApplications(companyName));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_COMPANY') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Application> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        ApplicationStatus status = ApplicationStatus.valueOf(statusMap.get("status"));
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }
}
