package com.align.compliance.service;

import com.align.compliance.dto.*;
import com.align.compliance.model.*;
import com.align.compliance.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplianceMappingService {

    private static final Logger log = LoggerFactory.getLogger(ComplianceMappingService.class);

    private final ComplianceMappingRepository mappingRepository;
    private final RegulationRepository regulationRepository;
    private final RegulatoryRequirementRepository requirementRepository;
    private final SOPRepository sopRepository;
    private final OrganizationMemberRepository memberRepository;

    public ComplianceMappingService(
            ComplianceMappingRepository mappingRepository,
            RegulationRepository regulationRepository,
            RegulatoryRequirementRepository requirementRepository,
            SOPRepository sopRepository,
            OrganizationMemberRepository memberRepository) {
        this.mappingRepository = mappingRepository;
        this.regulationRepository = regulationRepository;
        this.requirementRepository = requirementRepository;
        this.sopRepository = sopRepository;
        this.memberRepository = memberRepository;
    }

    public void verifyOrganizationMembership(String organizationId, String userId) {
        Optional<OrganizationMember> memberOpt = memberRepository.findByOrganizationIdAndUserId(organizationId, userId);
        if (memberOpt.isEmpty()) {
            throw new AccessDeniedException("Unauthorized access: You are not a member of this organization");
        }
    }

    public ComplianceMapping createMapping(String organizationId, String userId, CreateMappingRequest request) {
        verifyOrganizationMembership(organizationId, userId);

        // Prevent duplicate active mapping for the same requirement and SOP
        Optional<ComplianceMapping> existing = mappingRepository.findByOrganizationIdAndRequirementIdAndSopIdAndStatus(
                organizationId,
                request.getRequirementId(),
                request.getSopId(),
                ComplianceMapping.MappingStatus.ACTIVE
        );

        if (existing.isPresent()) {
            throw new IllegalArgumentException("A mapping between this requirement and SOP already exists for your organization.");
        }

        ComplianceMapping mapping = new ComplianceMapping(
                organizationId,
                request.getRegulationId(),
                request.getRegulationVersionId(),
                request.getRequirementId(),
                request.getSopId(),
                request.getSopVersionId(),
                request.getMappingType() != null ? request.getMappingType() : ComplianceMapping.MappingType.FULL,
                request.getConfidence() > 0 ? request.getConfidence() : 1.0,
                ComplianceMapping.MappingStatus.ACTIVE,
                request.getNotes(),
                userId
        );

        ComplianceMapping saved = mappingRepository.save(mapping);
        log.info("Created ComplianceMapping ID: {} (Req: {} -> SOP: {})", saved.getId(), request.getRequirementId(), request.getSopId());
        return saved;
    }

    public ComplianceMapping getMappingById(String organizationId, String userId, String id) {
        verifyOrganizationMembership(organizationId, userId);

        ComplianceMapping mapping = mappingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Compliance mapping not found with ID: " + id));

        if (!mapping.getOrganizationId().equals(organizationId)) {
            throw new AccessDeniedException("Unauthorized access to compliance mapping");
        }

        return mapping;
    }

    public List<ComplianceMapping> getMappings(String organizationId, String userId, String regulationId, String requirementId, String sopId, String mappingType, String status) {
        verifyOrganizationMembership(organizationId, userId);

        List<ComplianceMapping> allMappings = mappingRepository.findByOrganizationId(organizationId);

        return allMappings.stream()
                .filter(m -> {
                    if (regulationId != null && !regulationId.isBlank() && !m.getRegulationId().equals(regulationId)) return false;
                    if (requirementId != null && !requirementId.isBlank() && !m.getRequirementId().equals(requirementId)) return false;
                    if (sopId != null && !sopId.isBlank() && !m.getSopId().equals(sopId)) return false;
                    if (mappingType != null && !mappingType.isBlank() && !"ALL".equalsIgnoreCase(mappingType) && !m.getMappingType().name().equalsIgnoreCase(mappingType)) return false;
                    if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status) && !m.getStatus().name().equalsIgnoreCase(status)) return false;
                    return true;
                })
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .collect(Collectors.toList());
    }

    public ComplianceMapping updateMapping(String organizationId, String userId, String id, UpdateMappingRequest request) {
        ComplianceMapping mapping = getMappingById(organizationId, userId, id);

        if (request.getMappingType() != null) mapping.setMappingType(request.getMappingType());
        if (request.getConfidence() != null && request.getConfidence() > 0) mapping.setConfidence(request.getConfidence());
        if (request.getStatus() != null) mapping.setStatus(request.getStatus());
        if (request.getNotes() != null) mapping.setNotes(request.getNotes());
        if (request.getSopVersionId() != null) mapping.setSopVersionId(request.getSopVersionId());

        mapping.setUpdatedAt(Instant.now());
        ComplianceMapping updated = mappingRepository.save(mapping);
        log.info("Updated ComplianceMapping ID: {}", id);
        return updated;
    }

    public void deleteMapping(String organizationId, String userId, String id) {
        ComplianceMapping mapping = getMappingById(organizationId, userId, id);
        mappingRepository.delete(mapping);
        log.info("Deleted ComplianceMapping ID: {}", id);
    }

    public List<MappedSOPDetailResponse> getMappedSOPsForRegulation(String organizationId, String userId, String regulationId) {
        verifyOrganizationMembership(organizationId, userId);

        List<ComplianceMapping> mappings = mappingRepository.findByOrganizationIdAndRegulationId(organizationId, regulationId);

        return mappings.stream()
                .filter(m -> m.getStatus() == ComplianceMapping.MappingStatus.ACTIVE)
                .map(m -> {
                    MappedSOPDetailResponse res = new MappedSOPDetailResponse();
                    res.setMappingId(m.getId());
                    res.setSopId(m.getSopId());
                    res.setRequirementId(m.getRequirementId());
                    res.setMappedVersionId(m.getSopVersionId());
                    res.setMappingType(m.getMappingType());
                    res.setConfidence(m.getConfidence());
                    res.setStatus(m.getStatus());
                    res.setNotes(m.getNotes());
                    res.setCreatedBy(m.getCreatedBy());
                    res.setCreatedAt(m.getCreatedAt().toString());

                    // Resolve SOP Title & Department
                    sopRepository.findById(m.getSopId()).ifPresent(sop -> {
                        res.setSopTitle(sop.getTitle());
                        res.setDepartment(sop.getDepartment());
                        res.setCurrentVersion(sop.getCurrentVersion());
                    });

                    // Resolve Requirement Section Reference
                    requirementRepository.findById(m.getRequirementId()).ifPresent(req -> {
                        res.setSectionReference(req.getSectionReference());
                    });

                    return res;
                })
                .collect(Collectors.toList());
    }

    public List<MappedRequirementDetailResponse> getRequirementsForSOP(String organizationId, String userId, String sopId) {
        verifyOrganizationMembership(organizationId, userId);

        List<ComplianceMapping> mappings = mappingRepository.findByOrganizationIdAndSopId(organizationId, sopId);

        return mappings.stream()
                .filter(m -> m.getStatus() == ComplianceMapping.MappingStatus.ACTIVE)
                .map(m -> {
                    MappedRequirementDetailResponse res = new MappedRequirementDetailResponse();
                    res.setMappingId(m.getId());
                    res.setRegulationId(m.getRegulationId());
                    res.setRequirementId(m.getRequirementId());
                    res.setMappingType(m.getMappingType());
                    res.setConfidence(m.getConfidence());
                    res.setStatus(m.getStatus());
                    res.setNotes(m.getNotes());
                    res.setCreatedBy(m.getCreatedBy());
                    res.setCreatedAt(m.getCreatedAt().toString());

                    // Resolve Regulation Title, Jurisdiction, Authority
                    regulationRepository.findById(m.getRegulationId()).ifPresent(reg -> {
                        res.setRegulationTitle(reg.getTitle());
                        res.setJurisdiction(reg.getJurisdiction());
                        res.setAuthority(reg.getAuthority());
                    });

                    // Resolve Requirement Text & Section Reference
                    requirementRepository.findById(m.getRequirementId()).ifPresent(req -> {
                        res.setSectionReference(req.getSectionReference());
                        res.setRequirementText(req.getRequirementText());
                        res.setApplicability(req.getApplicability());
                    });

                    return res;
                })
                .collect(Collectors.toList());
    }
}
