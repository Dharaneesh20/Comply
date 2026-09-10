package com.align.compliance.service;

import com.align.compliance.dto.*;
import com.align.compliance.model.OrganizationMember;
import com.align.compliance.model.SOP;
import com.align.compliance.model.SOPVersion;
import com.align.compliance.model.User;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.repository.SOPRepository;
import com.align.compliance.repository.SOPVersionRepository;
import com.align.compliance.repository.UserRepository;
import com.align.compliance.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SOPService {

    private static final Logger log = LoggerFactory.getLogger(SOPService.class);

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    private final SOPRepository sopRepository;
    private final SOPVersionRepository sopVersionRepository;
    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final AuditService auditService;

    public SOPService(
            SOPRepository sopRepository,
            SOPVersionRepository sopVersionRepository,
            OrganizationMemberRepository memberRepository,
            UserRepository userRepository,
            StorageService storageService,
            AuditService auditService) {
        this.sopRepository = sopRepository;
        this.sopVersionRepository = sopVersionRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.auditService = auditService;
    }

    public void verifyOrganizationMembership(String organizationId, String userId) {
        Optional<OrganizationMember> memberOpt = memberRepository.findByOrganizationIdAndUserId(organizationId, userId);
        if (memberOpt.isEmpty()) {
            throw new AccessDeniedException("Unauthorized access: You are not a member of this organization");
        }
    }

    public DocumentMetadata uploadDocument(MultipartFile file, String organizationId, User currentUser) {
        verifyOrganizationMembership(organizationId, currentUser.getId());
        validateFile(file);

        return storageService.storeFile(file, organizationId, "sops");
    }

    public SOPResponse createSOP(CreateSOPRequest request, MultipartFile file, User currentUser) {
        verifyOrganizationMembership(request.getOrganizationId(), currentUser.getId());

        SOP sop = new SOP(
                request.getOrganizationId(),
                request.getTitle(),
                request.getDescription(),
                request.getDepartment(),
                currentUser.getId()
        );
        sop.setStatus("DRAFT");
        sop.setCurrentVersion(1);
        sop.setLastReviewedAt(Instant.now());
        sop.setNextReviewAt(Instant.now().plus(180, ChronoUnit.DAYS));

        DocumentMetadata metadata = null;
        if (file != null && !file.isEmpty()) {
            validateFile(file);
            metadata = storageService.storeFile(file, request.getOrganizationId(), "sops");
            sop.setCurrentDocumentMetadata(metadata);
        }

        SOP savedSop = sopRepository.save(sop);

        SOPVersion version = new SOPVersion(
                savedSop.getId(),
                1,
                metadata,
                metadata != null ? metadata.getStorageReference() : null,
                currentUser.getId(),
                request.getChangeSummary() != null ? request.getChangeSummary() : "Initial SOP creation"
        );
        sopVersionRepository.save(version);

        auditService.logEvent(
                savedSop.getOrganizationId(),
                currentUser.getId(),
                currentUser.getEmail(),
                "SOP_CREATED",
                "SOP",
                savedSop.getId(),
                "0.0.0.0",
                Map.of("title", savedSop.getTitle(), "department", savedSop.getDepartment())
        );

        return toSOPResponse(savedSop);
    }

    public List<SOPResponse> getSOPs(String organizationId, String status, String department, String search, User currentUser) {
        verifyOrganizationMembership(organizationId, currentUser.getId());

        List<SOP> sops = sopRepository.findByOrganizationId(organizationId);

        return sops.stream()
                .filter(s -> !StringUtils.hasText(status) || s.getStatus().equalsIgnoreCase(status))
                .filter(s -> !StringUtils.hasText(department) || s.getDepartment().equalsIgnoreCase(department))
                .filter(s -> !StringUtils.hasText(search) ||
                        s.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                        (s.getDescription() != null && s.getDescription().toLowerCase().contains(search.toLowerCase())))
                .map(this::toSOPResponse)
                .collect(Collectors.toList());
    }

    public SOPResponse getSOPById(String id, User currentUser) {
        SOP sop = sopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("SOP not found with ID: " + id));

        verifyOrganizationMembership(sop.getOrganizationId(), currentUser.getId());

        return toSOPResponse(sop);
    }

    public SOPResponse updateSOP(String id, UpdateSOPRequest request, User currentUser) {
        SOP sop = sopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("SOP not found with ID: " + id));

        verifyOrganizationMembership(sop.getOrganizationId(), currentUser.getId());

        if (StringUtils.hasText(request.getTitle())) sop.setTitle(request.getTitle());
        if (request.getDescription() != null) sop.setDescription(request.getDescription());
        if (StringUtils.hasText(request.getDepartment())) sop.setDepartment(request.getDepartment());
        if (StringUtils.hasText(request.getOwnerId())) sop.setOwnerId(request.getOwnerId());
        if (StringUtils.hasText(request.getStatus())) sop.setStatus(request.getStatus().toUpperCase());

        sop.setUpdatedAt(Instant.now());
        SOP updated = sopRepository.save(sop);
        return toSOPResponse(updated);
    }

    public SOPVersionResponse createNewVersion(String sopId, String changeSummary, MultipartFile file, User currentUser) {
        SOP sop = sopRepository.findById(sopId)
                .orElseThrow(() -> new IllegalArgumentException("SOP not found with ID: " + sopId));

        verifyOrganizationMembership(sop.getOrganizationId(), currentUser.getId());
        validateFile(file);

        DocumentMetadata metadata = storageService.storeFile(file, sop.getOrganizationId(), "sops");

        int nextVersionNum = sop.getCurrentVersion() + 1;
        sop.setCurrentVersion(nextVersionNum);
        sop.setCurrentDocumentMetadata(metadata);
        sop.setUpdatedAt(Instant.now());
        sopRepository.save(sop);

        SOPVersion version = new SOPVersion(
                sop.getId(),
                nextVersionNum,
                metadata,
                metadata.getStorageReference(),
                currentUser.getId(),
                StringUtils.hasText(changeSummary) ? changeSummary : "Updated to version " + nextVersionNum
        );

        SOPVersion savedVersion = sopVersionRepository.save(version);
        return toSOPVersionResponse(savedVersion);
    }

    public List<SOPVersionResponse> getSOPVersions(String sopId, User currentUser) {
        SOP sop = sopRepository.findById(sopId)
                .orElseThrow(() -> new IllegalArgumentException("SOP not found with ID: " + sopId));

        verifyOrganizationMembership(sop.getOrganizationId(), currentUser.getId());

        List<SOPVersion> versions = sopVersionRepository.findBySopIdOrderByVersionNumberDesc(sopId);
        return versions.stream().map(this::toSOPVersionResponse).collect(Collectors.toList());
    }

    public SOPResponse archiveSOP(String id, User currentUser) {
        SOP sop = sopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("SOP not found with ID: " + id));

        verifyOrganizationMembership(sop.getOrganizationId(), currentUser.getId());

        sop.setStatus("ARCHIVED");
        sop.setUpdatedAt(Instant.now());
        SOP archived = sopRepository.save(sop);
        return toSOPResponse(archived);
    }

    public SOPMetricsResponse getSOPMetrics(String organizationId, User currentUser) {
        verifyOrganizationMembership(organizationId, currentUser.getId());

        List<SOP> sops = sopRepository.findByOrganizationId(organizationId);
        long total = sops.size();
        long published = sops.stream().filter(s -> "PUBLISHED".equalsIgnoreCase(s.getStatus())).count();
        long draft = sops.stream().filter(s -> "DRAFT".equalsIgnoreCase(s.getStatus())).count();
        long archived = sops.stream().filter(s -> "ARCHIVED".equalsIgnoreCase(s.getStatus())).count();

        return new SOPMetricsResponse(total, published, draft, archived);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File attachment cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of 15MB");
        }
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        boolean isAllowedType = (contentType != null && ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) ||
                filename.endsWith(".pdf") || filename.endsWith(".docx") || filename.endsWith(".txt");

        if (!isAllowedType) {
            throw new IllegalArgumentException("Unsupported file type. Only PDF, DOCX, and TXT files are supported.");
        }
    }

    private SOPResponse toSOPResponse(SOP sop) {
        SOPResponse res = new SOPResponse();
        res.setId(sop.getId());
        res.setOrganizationId(sop.getOrganizationId());
        res.setTitle(sop.getTitle());
        res.setDescription(sop.getDescription());
        res.setDepartment(sop.getDepartment());
        res.setOwnerId(sop.getOwnerId());
        res.setStatus(sop.getStatus());
        res.setCurrentVersion(sop.getCurrentVersion());
        res.setCurrentDocumentMetadata(sop.getCurrentDocumentMetadata());
        res.setCreatedAt(sop.getCreatedAt());
        res.setUpdatedAt(sop.getUpdatedAt());
        res.setLastReviewedAt(sop.getLastReviewedAt());
        res.setNextReviewAt(sop.getNextReviewAt());

        if (StringUtils.hasText(sop.getOwnerId())) {
            userRepository.findById(sop.getOwnerId())
                    .ifPresent(u -> res.setOwnerName(u.getFullName()));
        }

        return res;
    }

    private SOPVersionResponse toSOPVersionResponse(SOPVersion version) {
        SOPVersionResponse res = new SOPVersionResponse();
        res.setId(version.getId());
        res.setSopId(version.getSopId());
        res.setVersionNumber(version.getVersionNumber());
        res.setDocumentMetadata(version.getDocumentMetadata());
        res.setStorageReference(version.getStorageReference());
        res.setCreatedBy(version.getCreatedBy());
        res.setCreatedAt(version.getCreatedAt());
        res.setChangeSummary(version.getChangeSummary());

        if (StringUtils.hasText(version.getCreatedBy())) {
            userRepository.findById(version.getCreatedBy())
                    .ifPresent(u -> res.setCreatorName(u.getFullName()));
        }

        return res;
    }
}
