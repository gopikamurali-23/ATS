package com.talentpulse.ats.dto;

import java.util.List;

public class ResumeParseResultDTO {

    private String fileName;
    private String extractedText;
    private Integer estimatedExperienceYears;
    private String extractedEducation;
    private List<String> extractedSkills;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private Integer atsMatchScore; // 0 - 100

    public ResumeParseResultDTO() {}

    public ResumeParseResultDTO(String fileName, String extractedText, Integer estimatedExperienceYears, String extractedEducation, List<String> extractedSkills, List<String> matchedSkills, List<String> missingSkills, Integer atsMatchScore) {
        this.fileName = fileName;
        this.extractedText = extractedText;
        this.estimatedExperienceYears = estimatedExperienceYears;
        this.extractedEducation = extractedEducation;
        this.extractedSkills = extractedSkills;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.atsMatchScore = atsMatchScore;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
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

    public List<String> getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(List<String> extractedSkills) {
        this.extractedSkills = extractedSkills;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public Integer getAtsMatchScore() {
        return atsMatchScore;
    }

    public void setAtsMatchScore(Integer atsMatchScore) {
        this.atsMatchScore = atsMatchScore;
    }
}
