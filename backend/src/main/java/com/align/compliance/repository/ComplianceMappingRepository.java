package com.align.compliance.repository;

import com.align.compliance.model.ComplianceMapping;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceMappingRepository extends MongoRepository<ComplianceMapping, String> {

    List<ComplianceMapping> findByOrganizationId(String organizationId);

    List<ComplianceMapping> findByOrganizationIdAndRegulationId(String organizationId, String regulationId);

    List<ComplianceMapping> findByOrganizationIdAndSopId(String organizationId, String sopId);

    List<ComplianceMapping> findByOrganizationIdAndRequirementId(String organizationId, String requirementId);

    Optional<ComplianceMapping> findByOrganizationIdAndRequirementIdAndSopIdAndStatus(
            String organizationId, 
            String requirementId, 
            String sopId, 
            ComplianceMapping.MappingStatus status
    );

    long countByOrganizationId(String organizationId);
}
