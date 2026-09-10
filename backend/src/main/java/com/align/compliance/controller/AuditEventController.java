package com.align.compliance.controller;

import com.align.compliance.model.AuditEvent;
import com.align.compliance.model.User;
import com.align.compliance.security.RolePermissionEvaluator;
import com.align.compliance.service.AuditService;
import com.align.compliance.service.PrivacyDocumentProcessingService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AuditEventController {

    private final AuditService auditService;
    private final RolePermissionEvaluator roleEvaluator;
    private final PrivacyDocumentProcessingService privacyService;

    public AuditEventController(AuditService auditService,
                                RolePermissionEvaluator roleEvaluator,
                                PrivacyDocumentProcessingService privacyService) {
        this.auditService = auditService;
        this.roleEvaluator = roleEvaluator;
        this.privacyService = privacyService;
    }

    @GetMapping("/audit-events")
    public ResponseEntity<?> getAuditEvents(
            @AuthenticationPrincipal User currentUser,
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        String currentUserId = currentUser.getId();
        if (!roleEvaluator.hasRoleOrHigher(currentUserId, organizationId, "REVIEWER")) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied. Minimum REVIEWER role required."));
        }

        Page<AuditEvent> events = auditService.getAuditEvents(organizationId, action, page, size);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/security/config")
    public ResponseEntity<?> getSecurityConfig(
            @AuthenticationPrincipal User currentUser,
            @RequestHeader("X-Organization-Id") String organizationId) {

        Map<String, Object> config = privacyService.getPrivacyConfiguration();
        String currentUserId = currentUser.getId();
        config.put("userRole", roleEvaluator.getUserRoleInOrg(currentUserId, organizationId));
        return ResponseEntity.ok(config);
    }
}
