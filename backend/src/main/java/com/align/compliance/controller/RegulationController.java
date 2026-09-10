package com.align.compliance.controller;

import com.align.compliance.dto.*;
import com.align.compliance.model.Regulation;
import com.align.compliance.model.RegulationVersion;
import com.align.compliance.model.RegulatoryRequirement;
import com.align.compliance.model.User;
import com.align.compliance.service.RegulationService;
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
@RequestMapping("/api/v1/regulations")
@Tag(name = "Regulatory Management", description = "Regulatory Frameworks, Versions, and Requirements APIs")
public class RegulationController {

    private final RegulationService regulationService;

    public RegulationController(RegulationService regulationService) {
        this.regulationService = regulationService;
    }

    @PostMapping
    @Operation(summary = "Create Regulation Framework", description = "Establishes a new regulatory framework entry in MongoDB.")
    public ResponseEntity<Regulation> createRegulation(
            @RequestHeader("X-Organization-Id") String organizationId,
            @Valid @RequestBody CreateRegulationRequest request,
            @AuthenticationPrincipal User currentUser) {
        Regulation regulation = regulationService.createRegulation(organizationId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(regulation);
    }

    @GetMapping
    @Operation(summary = "List & Search Regulations", description = "Retrieves paginated regulations for an organization with jurisdiction, authority, status, and text filtering.")
    public ResponseEntity<Page<Regulation>> getRegulations(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "jurisdiction", required = false) String jurisdiction,
            @RequestParam(value = "authority", required = false) String authority,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Regulation> regulations = regulationService.getRegulations(organizationId, currentUser.getId(), search, jurisdiction, authority, status, pageable);
        return ResponseEntity.ok(regulations);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Regulation Detail", description = "Fetches a specific regulatory framework document by ID.")
    public ResponseEntity<Regulation> getRegulationById(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        Regulation regulation = regulationService.getRegulationById(organizationId, currentUser.getId(), id);
        return ResponseEntity.ok(regulation);
    }

    @PostMapping("/{id}/versions")
    @Operation(summary = "Create Regulation Version", description = "Adds a new version entry for a specific regulation.")
    public ResponseEntity<RegulationVersion> createRegulationVersion(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @Valid @RequestBody CreateRegulationVersionRequest request,
            @AuthenticationPrincipal User currentUser) {
        RegulationVersion version = regulationService.createRegulationVersion(organizationId, currentUser.getId(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(version);
    }

    @GetMapping("/{id}/versions")
    @Operation(summary = "Get Regulation Versions", description = "Lists all version records for a specific regulation.")
    public ResponseEntity<List<RegulationVersion>> getRegulationVersions(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        List<RegulationVersion> versions = regulationService.getRegulationVersions(organizationId, currentUser.getId(), id);
        return ResponseEntity.ok(versions);
    }

    @PostMapping("/{id}/requirements")
    @Operation(summary = "Add Regulatory Requirement", description = "Adds a specific requirement clause to a regulation.")
    public ResponseEntity<RegulatoryRequirement> addRequirement(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @Valid @RequestBody CreateRequirementRequest request,
            @AuthenticationPrincipal User currentUser) {
        RegulatoryRequirement requirement = regulationService.addRequirement(organizationId, currentUser.getId(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(requirement);
    }

    @GetMapping("/{id}/requirements")
    @Operation(summary = "Get Regulation Requirements", description = "Retrieves all requirement clauses associated with a regulation or specific version.")
    public ResponseEntity<List<RegulatoryRequirement>> getRequirements(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @RequestParam(value = "versionId", required = false) String versionId,
            @AuthenticationPrincipal User currentUser) {
        List<RegulatoryRequirement> requirements = regulationService.getRequirements(organizationId, currentUser.getId(), id, versionId);
        return ResponseEntity.ok(requirements);
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get Regulatory Metrics", description = "Retrieves counts for total regulations, active, draft, superseded, and total requirements.")
    public ResponseEntity<RegulationMetricsResponse> getMetrics(
            @RequestHeader("X-Organization-Id") String organizationId,
            @AuthenticationPrincipal User currentUser) {
        RegulationMetricsResponse metrics = regulationService.getMetrics(organizationId, currentUser.getId());
        return ResponseEntity.ok(metrics);
    }
}
