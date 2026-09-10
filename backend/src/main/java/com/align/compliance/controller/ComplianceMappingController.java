package com.align.compliance.controller;

import com.align.compliance.dto.*;
import com.align.compliance.model.ComplianceMapping;
import com.align.compliance.model.User;
import com.align.compliance.service.ComplianceMappingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Compliance Mappings", description = "Regulatory Requirement to SOP Mapping Lifecycle APIs")
public class ComplianceMappingController {

    private final ComplianceMappingService mappingService;

    public ComplianceMappingController(ComplianceMappingService mappingService) {
        this.mappingService = mappingService;
    }

    @PostMapping("/mappings")
    @Operation(summary = "Create Compliance Mapping", description = "Establishes a explicit relationship between a regulatory requirement and an SOP/version.")
    public ResponseEntity<ComplianceMapping> createMapping(
            @RequestHeader("X-Organization-Id") String organizationId,
            @Valid @RequestBody CreateMappingRequest request,
            @AuthenticationPrincipal User currentUser) {
        ComplianceMapping mapping = mappingService.createMapping(organizationId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapping);
    }

    @GetMapping("/mappings")
    @Operation(summary = "List Compliance Mappings", description = "Retrieves all compliance mappings for an organization with optional filters.")
    public ResponseEntity<List<ComplianceMapping>> getMappings(
            @RequestHeader("X-Organization-Id") String organizationId,
            @RequestParam(value = "regulationId", required = false) String regulationId,
            @RequestParam(value = "requirementId", required = false) String requirementId,
            @RequestParam(value = "sopId", required = false) String sopId,
            @RequestParam(value = "mappingType", required = false) String mappingType,
            @RequestParam(value = "status", required = false) String status,
            @AuthenticationPrincipal User currentUser) {
        List<ComplianceMapping> mappings = mappingService.getMappings(organizationId, currentUser.getId(), regulationId, requirementId, sopId, mappingType, status);
        return ResponseEntity.ok(mappings);
    }

    @GetMapping("/mappings/{id}")
    @Operation(summary = "Get Mapping Detail", description = "Fetches a specific compliance mapping record by ID.")
    public ResponseEntity<ComplianceMapping> getMappingById(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        ComplianceMapping mapping = mappingService.getMappingById(organizationId, currentUser.getId(), id);
        return ResponseEntity.ok(mapping);
    }

    @PutMapping("/mappings/{id}")
    @Operation(summary = "Update Compliance Mapping", description = "Updates mapping status, mapping type, notes, or confidence level.")
    public ResponseEntity<ComplianceMapping> updateMapping(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @RequestBody UpdateMappingRequest request,
            @AuthenticationPrincipal User currentUser) {
        ComplianceMapping updated = mappingService.updateMapping(organizationId, currentUser.getId(), id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/mappings/{id}")
    @Operation(summary = "Delete Compliance Mapping", description = "Deletes a compliance mapping relationship.")
    public ResponseEntity<Void> deleteMapping(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        mappingService.deleteMapping(organizationId, currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/regulations/{id}/mapped-sops")
    @Operation(summary = "Get Mapped SOPs for Regulation", description = "Retrieves all SOPs explicitly mapped to requirements of a specific regulation.")
    public ResponseEntity<List<MappedSOPDetailResponse>> getMappedSOPsForRegulation(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        List<MappedSOPDetailResponse> mappedSops = mappingService.getMappedSOPsForRegulation(organizationId, currentUser.getId(), id);
        return ResponseEntity.ok(mappedSops);
    }

    @GetMapping("/sops/{id}/requirements")
    @Operation(summary = "Get Mapped Requirements for SOP", description = "Retrieves all regulatory requirements explicitly mapped to a specific SOP.")
    public ResponseEntity<List<MappedRequirementDetailResponse>> getRequirementsForSOP(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        List<MappedRequirementDetailResponse> mappedRequirements = mappingService.getRequirementsForSOP(organizationId, currentUser.getId(), id);
        return ResponseEntity.ok(mappedRequirements);
    }
}
