package com.align.compliance.repository;

import com.align.compliance.model.ChangeImpact;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeImpactRepository extends MongoRepository<ChangeImpact, String> {
    List<ChangeImpact> findByOrganizationIdAndChangeId(String organizationId, String changeId);
    List<ChangeImpact> findByOrganizationId(String organizationId);
}
