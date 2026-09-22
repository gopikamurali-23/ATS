package com.talentpulse.ats.dto;

import java.util.Map;

public class DashboardStatsDTO {

    private long totalJobs;
    private long totalApplications;
    private long totalCandidates;
    private double avgMatchScore;

    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> topSkills;
    private Map<String, Long> monthlyFunnel;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(long totalJobs, long totalApplications, long totalCandidates, double avgMatchScore, Map<String, Long> applicationsByStatus, Map<String, Long> topSkills, Map<String, Long> monthlyFunnel) {
        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
        this.totalCandidates = totalCandidates;
        this.avgMatchScore = avgMatchScore;
        this.applicationsByStatus = applicationsByStatus;
        this.topSkills = topSkills;
        this.monthlyFunnel = monthlyFunnel;
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getTotalCandidates() {
        return totalCandidates;
    }

    public void setTotalCandidates(long totalCandidates) {
        this.totalCandidates = totalCandidates;
    }

    public double getAvgMatchScore() {
        return avgMatchScore;
    }

    public void setAvgMatchScore(double avgMatchScore) {
        this.avgMatchScore = avgMatchScore;
    }

    public Map<String, Long> getApplicationsByStatus() {
        return applicationsByStatus;
    }

    public void setApplicationsByStatus(Map<String, Long> applicationsByStatus) {
        this.applicationsByStatus = applicationsByStatus;
    }

    public Map<String, Long> getTopSkills() {
        return topSkills;
    }

    public void setTopSkills(Map<String, Long> topSkills) {
        this.topSkills = topSkills;
    }

    public Map<String, Long> getMonthlyFunnel() {
        return monthlyFunnel;
    }

    public void setMonthlyFunnel(Map<String, Long> monthlyFunnel) {
        this.monthlyFunnel = monthlyFunnel;
    }
}
