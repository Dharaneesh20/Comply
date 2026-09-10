package com.align.compliance.repository;

import com.align.compliance.model.AIReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIReviewRepository extends MongoRepository<AIReview, String> {

    List<AIReview> findByOrganizationIdAndAnalysisId(String organizationId, String analysisId);
}
