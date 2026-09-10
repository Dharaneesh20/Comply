package com.align.compliance.controller;

import com.align.compliance.dto.CreateOrganizationRequest;
import com.align.compliance.dto.OrganizationResponse;
import com.align.compliance.model.User;
import com.align.compliance.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organizations")
@Tag(name = "Organizations", description = "Organization creation, listing, and membership management endpoints")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping
    @Operation(summary = "Create organization", description = "Creates a new organization and grants the creator ADMIN membership.")
    public ResponseEntity<OrganizationResponse> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            @AuthenticationPrincipal User currentUser) {
        OrganizationResponse response = organizationService.createOrganization(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List user organizations", description = "Retrieves all organizations that the current authenticated user belongs to.")
    public ResponseEntity<List<OrganizationResponse>> getOrganizations(@AuthenticationPrincipal User currentUser) {
        List<OrganizationResponse> response = organizationService.getUserOrganizations(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get organization by ID", description = "Retrieves organization details. Returns 403 Forbidden if user is not a member.")
    public ResponseEntity<OrganizationResponse> getOrganizationById(
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        OrganizationResponse response = organizationService.getOrganizationById(id, currentUser);
        return ResponseEntity.ok(response);
    }
}
