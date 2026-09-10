package com.align.compliance.controller;

import com.align.compliance.dto.SubmitEvidenceRequest;
import com.align.compliance.dto.SubmitObservationRequest;
import com.align.compliance.model.OperationalEvidence;
import com.align.compliance.model.ProcessObservation;
import com.align.compliance.model.SOPHealthAssessment;
import com.align.compliance.model.User;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.service.SOPHealthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class SOPHealthController {

    private final SOPHealthService sopHealthService;
    private final OrganizationMemberRepository memberRepository;

    public SOPHealthController(SOPHealthService sopHealthService, OrganizationMemberRepository memberRepository) {
        this.sopHealthService = sopHealthService;
        this.memberRepository = memberRepository;
    }

    private void verifyMembership(String orgId, String userId) {
        if (memberRepository.findByOrganizationIdAndUserId(orgId, userId).isEmpty()) {
            throw new AccessDeniedException("Unauthorized access: You are not a member of this organization");
        }
    }

    @PostMapping("/evidence")
    public ResponseEntity<OperationalEvidence> recordEvidence(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestBody SubmitEvidenceRequest request,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        OperationalEvidence evidence = sopHealthService.recordEvidence(organizationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(evidence);
    }

    @GetMapping("/evidence")
    public ResponseEntity<List<OperationalEvidence>> getEvidence(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestParam(required = false) String sopId,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        List<OperationalEvidence> list = sopHealthService.getEvidence(organizationId, sopId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/evidence/observation")
    public ResponseEntity<ProcessObservation> recordObservation(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestBody SubmitObservationRequest request,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        ProcessObservation obs = sopHealthService.recordObservation(organizationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(obs);
    }

    @PostMapping("/sop-health/analyze/{sopId}")
    public ResponseEntity<SOPHealthAssessment> analyzeSOPHealth(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String sopId,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        SOPHealthAssessment assessment = sopHealthService.analyzeSOPHealth(organizationId, sopId);
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/sop-health/{sopId}")
    public ResponseEntity<SOPHealthAssessment> getSOPHealth(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable String sopId,
            @AuthenticationPrincipal User currentUser) {
        verifyMembership(organizationId, currentUser.getId());
        return sopHealthService.getLatestHealthAssessment(organizationId, sopId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(sopHealthService.analyzeSOPHealth(organizationId, sopId)));
    }
}
