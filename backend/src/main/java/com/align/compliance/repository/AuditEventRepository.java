package com.align.compliance.repository;

import com.align.compliance.model.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends MongoRepository<AuditEvent, String> {

    Page<AuditEvent> findByOrganizationIdOrderByTimestampDesc(String organizationId, Pageable pageable);

    Page<AuditEvent> findByOrganizationIdAndActionOrderByTimestampDesc(String organizationId, String action, Pageable pageable);

    List<AuditEvent> findByOrganizationIdAndResourceIdOrderByTimestampDesc(String organizationId, String resourceId);
}
