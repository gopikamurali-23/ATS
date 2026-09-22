package com.talentpulse.ats.repository;

import com.talentpulse.ats.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByActiveTrueOrderByCreatedAtDesc();
    List<Job> findByCompanyNameOrderByCreatedAtDesc(String companyName);
}
