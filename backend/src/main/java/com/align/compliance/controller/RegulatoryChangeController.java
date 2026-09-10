package com.align.compliance.controller;

import com.align.compliance.dto.AnalyzeChangeRequest;
import com.align.compliance.dto.UpdateImpactStatusRequest;
import com.align.compliance.model.ChangeImpact;
import com.align.compliance.model.RegulatoryChange;
import com.align.compliance.model.User;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.service.RegulatoryChangeService;
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
@Tag(name = "Regulatory Change Impact Analysis", description = "Version comparison, change detection, and SOP impact assessment APIs")
public class RegulatoryChangeController {

    private final RegulatoryChangeService changeService;
    private final OrganizationMemberRepository memberRepository;

    public RegulatoryChangeController(RegulatoryChangeService changeService, OrganizationMemberRepository memberRepository) {
        this.changeService = changeService;
        this.memberRepository = memberRepository;
    }

    private void verifyMembership(String orgId, String userId) {
        if (memberRepository.findByOrganizationIdAndUserId(orgId, userId).isEmpty()) {
            throw new AccessDeniedException("Unauthorized access: You are not a member of this organization");
        }
    }

    @PostMapping("/regulations/{id}/analyze-change")
    @Operation(summary = "Analyze Regulation Version Change", description = "Compares regulation versions, detects requirement diffs, and generates SOP impact reports.")
    public ResponseEntity<RegulatoryChange> analyzeChange(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String id,
            @RequestBody(required = false) AnalyzeChangeRequest request,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        RegulatoryChange change = changeService.analyzeRegulationChange(organizationId, id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(change);
    }

    @GetMapping("/regulatory-changes")
    @Operation(summary = "Get Regulatory Changes", description = "Lists detected regulatory changes for the organization.")
    public ResponseEntity<List<RegulatoryChange>> getRegulatoryChanges(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestParam(required = false) String regulationId,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        List<RegulatoryChange> list = changeService.getRegulatoryChanges(organizationId, regulationId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/regulatory-changes/{id}")
    @Operation(summary = "Get Regulatory Change Details", description = "Fetches a single regulatory change report.")
    public ResponseEntity<RegulatoryChange> getRegulatoryChangeById(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        RegulatoryChange change = changeService.getRegulatoryChangeById(organizationId, id);
        return ResponseEntity.ok(change);
    }

    @GetMapping("/regulatory-changes/{id}/impacts")
    @Operation(summary = "Get Change Impacts", description = "Fetches affected SOPs and department impacts for a regulatory change.")
    public ResponseEntity<List<ChangeImpact>> getChangeImpacts(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        List<ChangeImpact> impacts = changeService.getChangeImpacts(organizationId, id);
        return ResponseEntity.ok(impacts);
    }

    @PostMapping("/change-impacts/{id}/status")
    @Operation(summary = "Update Impact Review Status", description = "Transitions the review status of a change impact entry.")
    public ResponseEntity<ChangeImpact> updateImpactStatus(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String id,
            @RequestBody UpdateImpactStatusRequest request,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        ChangeImpact impact = changeService.updateImpactStatus(organizationId, id, request);
        return ResponseEntity.ok(impact);
    }
}
