package com.align.compliance.repository;

import com.align.compliance.model.SOP;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SOPRepository extends MongoRepository<SOP, String> {
    List<SOP> findByOrganizationId(String organizationId);
    List<SOP> findByOrganizationIdAndStatus(String organizationId, String status);
    List<SOP> findByOrganizationIdAndDepartment(String organizationId, String department);
    Optional<SOP> findByIdAndOrganizationId(String id, String organizationId);
    long countByOrganizationId(String organizationId);
}
