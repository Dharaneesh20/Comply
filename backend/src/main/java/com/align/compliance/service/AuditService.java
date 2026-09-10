package com.align.compliance.service;

import com.align.compliance.model.AuditEvent;
import com.align.compliance.repository.AuditEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    public void logEvent(String organizationId, String actorId, String actorEmail, String action,
                         String resourceType, String resourceId, String ipAddress, Map<String, Object> metadata) {
        try {
            AuditEvent event = new AuditEvent(
                    organizationId,
                    actorId,
                    actorEmail,
                    action,
                    resourceType,
                    resourceId,
                    ipAddress,
                    metadata
            );
            auditEventRepository.save(event);
            log.debug("Audit log saved: action={} org={} actor={}", action, organizationId, actorEmail);
        } catch (Exception e) {
            log.error("Failed to log audit event: action={} org={}", action, organizationId, e);
        }
    }

    public Page<AuditEvent> getAuditEvents(String organizationId, String action, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (action != null && !action.trim().isEmpty() && !"ALL".equalsIgnoreCase(action)) {
            return auditEventRepository.findByOrganizationIdAndActionOrderByTimestampDesc(organizationId, action, pageable);
        }
        return auditEventRepository.findByOrganizationIdOrderByTimestampDesc(organizationId, pageable);
    }
}
