package com.align.compliance.repository;

import com.align.compliance.model.ComplianceFinding;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceFindingRepository extends MongoRepository<ComplianceFinding, String> {

    List<ComplianceFinding> findByOrganizationId(String organizationId);

    Page<ComplianceFinding> findByOrganizationId(String organizationId, Pageable pageable);

    Optional<ComplianceFinding> findByOrganizationIdAndRequirementIdAndSopIdAndFindingType(
            String organizationId, 
            String requirementId, 
            String sopId, 
            ComplianceFinding.FindingType findingType
    );

    long countByOrganizationId(String organizationId);

    long countByOrganizationIdAndStatus(String organizationId, ComplianceFinding.Status status);

    long countByOrganizationIdAndSeverity(String organizationId, ComplianceFinding.Severity severity);

    long countByOrganizationIdAndStatusIn(String organizationId, List<ComplianceFinding.Status> statuses);
}
