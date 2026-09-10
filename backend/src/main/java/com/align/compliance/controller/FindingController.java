package com.align.compliance.controller;

import com.align.compliance.dto.*;
import com.align.compliance.model.ComplianceFinding;
import com.align.compliance.model.User;
import com.align.compliance.service.RiskAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/findings")
@Tag(name = "Compliance Findings & Risk Engine", description = "Compliance Gap Detection, Risk Assessment, and Lifecycle APIs")
public class FindingController {

    private final RiskAssessmentService riskAssessmentService;

    public FindingController(RiskAssessmentService riskAssessmentService) {
        this.riskAssessmentService = riskAssessmentService;
    }

    @PostMapping
    @Operation(summary = "Create Manual Compliance Finding", description = "Creates a new compliance finding entry in MongoDB.")
    public ResponseEntity<ComplianceFinding> createFinding(
            @RequestHeader("X-Organization-Id") String organizationId,
            @Valid @RequestBody CreateFindingRequest request,
            @AuthenticationPrincipal User currentUser) {
        ComplianceFinding finding = riskAssessmentService.createFinding(organizationId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(finding);
    }

    @PostMapping("/evaluate")
    @Operation(summary = "Run Risk Assessment Engine", description = "Triggers the deterministic Risk Assessment Engine scan to evaluate compliance gaps and partial coverages.")
    public ResponseEntity<List<ComplianceFinding>> evaluateFindings(
            @RequestHeader("X-Organization-Id") String organizationId,
            @AuthenticationPrincipal User currentUser) {
        List<ComplianceFinding> findings = riskAssessmentService.evaluateComplianceFindings(organizationId, currentUser.getId());
        return ResponseEntity.ok(findings);
    }

    @GetMapping
    @Operation(summary = "List & Filter Compliance Findings", description = "Retrieves paginated compliance findings for an organization with severity, status, and department filtering.")
    public ResponseEntity<Page<FindingResponse>> getFindings(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "severity", required = false) String severity,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "sopId", required = false) String sopId,
            @RequestParam(value = "regulationId", required = false) String regulationId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FindingResponse> findings = riskAssessmentService.getFindings(
                organizationId, 
                currentUser.getId(), 
                search, 
                severity, 
                status, 
                department, 
                sopId, 
                regulationId, 
                pageable
        );
        return ResponseEntity.ok(findings);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Finding Detail", description = "Fetches a specific compliance finding with resolved Regulation and SOP references.")
    public ResponseEntity<FindingResponse> getFindingById(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        FindingResponse finding = riskAssessmentService.getFindingById(organizationId, currentUser.getId(), id);
        return ResponseEntity.ok(finding);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Finding Information", description = "Updates details, severity, risk score, or reviewer assignment for a finding.")
    public ResponseEntity<FindingResponse> updateFinding(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @RequestBody UpdateFindingRequest request,
            @AuthenticationPrincipal User currentUser) {
        FindingResponse updated = riskAssessmentService.updateFinding(organizationId, currentUser.getId(), id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "Update Finding Status", description = "Transitions finding status (e.g., OPEN -> UNDER_REVIEW -> RESOLVED -> DISMISSED).")
    public ResponseEntity<FindingResponse> updateFindingStatus(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @Valid @RequestBody UpdateFindingStatusRequest request,
            @AuthenticationPrincipal User currentUser) {
        FindingResponse updated = riskAssessmentService.updateFindingStatus(organizationId, currentUser.getId(), id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get Finding Metrics", description = "Retrieves real-time counts for Open, Critical, High, Medium, Low, and Resolved findings.")
    public ResponseEntity<FindingMetricsResponse> getMetrics(
            @RequestHeader("X-Organization-Id") String organizationId,
            @AuthenticationPrincipal User currentUser) {
        FindingMetricsResponse metrics = riskAssessmentService.getMetrics(organizationId, currentUser.getId());
        return ResponseEntity.ok(metrics);
    }
}
