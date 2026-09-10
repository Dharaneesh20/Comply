package com.align.compliance.controller;

import com.align.compliance.dto.*;
import com.align.compliance.model.*;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.service.RemediationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Remediation & SOP Improvement Workflow", description = "Remediation tasks, SOP reviews, approvals, and automated finding resolution APIs")
public class RemediationController {

    private final RemediationService remediationService;
    private final OrganizationMemberRepository memberRepository;

    public RemediationController(RemediationService remediationService, OrganizationMemberRepository memberRepository) {
        this.remediationService = remediationService;
        this.memberRepository = memberRepository;
    }

    private void verifyMembership(String orgId, String userId) {
        if (memberRepository.findByOrganizationIdAndUserId(orgId, userId).isEmpty()) {
            throw new AccessDeniedException("Unauthorized access: You are not a member of this organization");
        }
    }

    @PostMapping("/remediations")
    @Operation(summary = "Create Remediation Task", description = "Creates a remediation task linked to a compliance finding.")
    public ResponseEntity<RemediationTask> createRemediation(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestBody CreateRemediationRequest request,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        RemediationTask task = remediationService.createRemediation(organizationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @GetMapping("/remediations")
    @Operation(summary = "Get Remediation Tasks", description = "Lists remediation tasks for the organization with optional finding or SOP filters.")
    public ResponseEntity<List<RemediationTask>> getRemediations(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestParam(required = false) String findingId,
            @RequestParam(required = false) String sopId,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        List<RemediationTask> list = remediationService.getRemediations(organizationId, findingId, sopId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/remediations/{id}")
    @Operation(summary = "Get Remediation Task Details", description = "Fetches a single remediation task.")
    public ResponseEntity<RemediationTask> getRemediationById(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        RemediationTask task = remediationService.getRemediationById(organizationId, id);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/remediations/{id}")
    @Operation(summary = "Update Remediation Task", description = "Updates status, priority, or assignee for a remediation task.")
    public ResponseEntity<RemediationTask> updateRemediation(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String id,
            @RequestBody UpdateRemediationRequest request,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        RemediationTask updated = remediationService.updateRemediation(organizationId, id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/sops/{id}/review")
    @Operation(summary = "Submit SOP Version for Review", description = "Transitions SOP version to IN_REVIEW status and logs review notes.")
    public ResponseEntity<SOPReview> submitSOPReview(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String id,
            @RequestBody ReviewSOPRequest request,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        SOPReview review = remediationService.submitSOPReview(organizationId, id, currentUser.getId(), request);
        return ResponseEntity.ok(review);
    }

    @PostMapping("/sops/{id}/approve")
    @Operation(summary = "Approve and Activate SOP Version", description = "Approves SOP version, sets status to ACTIVE, and automatically resolves linked compliance findings.")
    public ResponseEntity<SOPApproval> approveSOP(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String id,
            @RequestBody ApproveSOPRequest request,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        SOPApproval approval = remediationService.approveSOP(organizationId, id, currentUser.getId(), request);
        return ResponseEntity.ok(approval);
    }
}
