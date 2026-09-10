package com.align.compliance.repository;

import com.align.compliance.model.RemediationTask;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RemediationTaskRepository extends MongoRepository<RemediationTask, String> {
    List<RemediationTask> findByOrganizationId(String organizationId);
    List<RemediationTask> findByOrganizationIdAndFindingId(String organizationId, String findingId);
    List<RemediationTask> findByOrganizationIdAndSopId(String organizationId, String sopId);
}
