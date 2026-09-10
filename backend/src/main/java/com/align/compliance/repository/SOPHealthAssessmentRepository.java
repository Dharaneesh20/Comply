package com.align.compliance.repository;

import com.align.compliance.model.SOPHealthAssessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SOPHealthAssessmentRepository extends MongoRepository<SOPHealthAssessment, String> {
    Optional<SOPHealthAssessment> findTopByOrganizationIdAndSopIdOrderByLastAnalyzedAtDesc(String organizationId, String sopId);
}
