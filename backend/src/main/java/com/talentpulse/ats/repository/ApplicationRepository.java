package com.talentpulse.ats.repository;

import com.talentpulse.ats.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);
    List<Application> findByJobIdOrderByMatchScoreDesc(Long jobId);
    List<Application> findByJobCompanyNameOrderByAppliedAtDesc(String companyName);
    List<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    @Query("SELECT COUNT(a) FROM Application a")
    long countTotalApplications();

    @Query("SELECT AVG(a.matchScore) FROM Application a")
    Double getAverageMatchScore();
}
