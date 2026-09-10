package com.align.compliance.controller;

import com.align.compliance.dto.*;
import com.align.compliance.model.User;
import com.align.compliance.service.SOPService;
import com.align.compliance.storage.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sops")
@Tag(name = "SOP Management", description = "Standard Operating Procedure creation, versioning, storage, and lifecycle APIs")
public class SOPController {

    private final SOPService sopService;
    private final StorageService storageService;

    public SOPController(SOPService sopService, StorageService storageService) {
        this.sopService = sopService;
        this.storageService = storageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create SOP with optional document", description = "Creates a new SOP record and uploads an initial document version (PDF, DOCX, TXT).")
    public ResponseEntity<SOPResponse> createSOP(
            @RequestPart("data") @Valid CreateSOPRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        SOPResponse response = sopService.createSOP(request, file, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List SOPs", description = "Retrieves all SOPs for an organization with optional status, department, and text search filtering.")
    public ResponseEntity<List<SOPResponse>> getSOPs(
            @RequestParam("organizationId") String organizationId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "search", required = false) String search,
            @AuthenticationPrincipal User currentUser) {
        List<SOPResponse> sops = sopService.getSOPs(organizationId, status, department, search, currentUser);
        return ResponseEntity.ok(sops);
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get SOP Metrics", description = "Retrieves real SOP counts (Total, Published, Draft, Archived) for an organization.")
    public ResponseEntity<SOPMetricsResponse> getMetrics(
            @RequestParam("organizationId") String organizationId,
            @AuthenticationPrincipal User currentUser) {
        SOPMetricsResponse metrics = sopService.getSOPMetrics(organizationId, currentUser);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get SOP by ID", description = "Retrieves details of a specific SOP.")
    public ResponseEntity<SOPResponse> getSOPById(
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        SOPResponse response = sopService.getSOPById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update SOP details", description = "Updates metadata (title, department, status) of an existing SOP.")
    public ResponseEntity<SOPResponse> updateSOP(
            @PathVariable("id") String id,
            @RequestBody UpdateSOPRequest request,
            @AuthenticationPrincipal User currentUser) {
        SOPResponse response = sopService.updateSOP(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Standalone Document Upload", description = "Uploads a document file to StorageService and returns metadata.")
    public ResponseEntity<DocumentMetadata> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("organizationId") String organizationId,
            @AuthenticationPrincipal User currentUser) {
        DocumentMetadata metadata = sopService.uploadDocument(file, organizationId, currentUser);
        return ResponseEntity.ok(metadata);
    }

    @PostMapping(value = "/{id}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create New SOP Version", description = "Uploads a new document revision and increments the SOP version number.")
    public ResponseEntity<SOPVersionResponse> createNewVersion(
            @PathVariable("id") String id,
            @RequestParam(value = "changeSummary", required = false) String changeSummary,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        SOPVersionResponse response = sopService.createNewVersion(id, changeSummary, file, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/versions")
    @Operation(summary = "Get SOP Version History", description = "Retrieves complete revision history for an SOP in descending order.")
    public ResponseEntity<List<SOPVersionResponse>> getVersions(
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        List<SOPVersionResponse> versions = sopService.getSOPVersions(id, currentUser);
        return ResponseEntity.ok(versions);
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive SOP", description = "Marks an SOP status as ARCHIVED.")
    public ResponseEntity<SOPResponse> archiveSOP(
            @PathVariable("id") String id,
            @AuthenticationPrincipal User currentUser) {
        SOPResponse response = sopService.archiveSOP(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download")
    @Operation(summary = "Download SOP Document File", description = "Downloads stored document file by storage reference.")
    public ResponseEntity<Resource> downloadFile(@RequestParam("ref") String storageReference) {
        Resource resource = storageService.loadFileAsResource(storageReference);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
