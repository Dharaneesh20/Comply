package com.align.compliance.repository;

import com.align.compliance.model.SOPApproval;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOPApprovalRepository extends MongoRepository<SOPApproval, String> {
    List<SOPApproval> findByOrganizationIdAndSopId(String organizationId, String sopId);
}
