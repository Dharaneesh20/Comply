package com.align.compliance.repository;

import com.align.compliance.model.OperationalEvidence;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationalEvidenceRepository extends MongoRepository<OperationalEvidence, String> {
    List<OperationalEvidence> findByOrganizationIdAndSopId(String organizationId, String sopId);
    List<OperationalEvidence> findByOrganizationIdAndSopIdAndCaseId(String organizationId, String sopId, String caseId);
    List<OperationalEvidence> findByOrganizationId(String organizationId);
}
