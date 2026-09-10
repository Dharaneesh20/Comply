package com.align.compliance.repository;

import com.align.compliance.model.SOPReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOPReviewRepository extends MongoRepository<SOPReview, String> {
    List<SOPReview> findByOrganizationIdAndSopId(String organizationId, String sopId);
}
