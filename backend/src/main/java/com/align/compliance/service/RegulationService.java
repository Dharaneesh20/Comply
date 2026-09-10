package com.align.compliance.service;

import com.align.compliance.dto.*;
import com.align.compliance.model.*;
import com.align.compliance.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RegulationService {

    private static final Logger log = LoggerFactory.getLogger(RegulationService.class);

    private final RegulationRepository regulationRepository;
    private final RegulationVersionRepository versionRepository;
    private final RegulatoryRequirementRepository requirementRepository;
    private final RegulatorySourceRepository sourceRepository;
    private final OrganizationMemberRepository memberRepository;

    public RegulationService(
            RegulationRepository regulationRepository,
            RegulationVersionRepository versionRepository,
            RegulatoryRequirementRepository requirementRepository,
            RegulatorySourceRepository sourceRepository,
            OrganizationMemberRepository memberRepository) {
        this.regulationRepository = regulationRepository;
        this.versionRepository = versionRepository;
        this.requirementRepository = requirementRepository;
        this.sourceRepository = sourceRepository;
        this.memberRepository = memberRepository;
    }

    public void verifyOrganizationMembership(String organizationId, String userId) {
        Optional<OrganizationMember> memberOpt = memberRepository.findByOrganizationIdAndUserId(organizationId, userId);
        if (memberOpt.isEmpty()) {
            throw new AccessDeniedException("Unauthorized access: You are not a member of this organization");
        }
    }

    public Regulation createRegulation(String organizationId, String userId, CreateRegulationRequest request) {
        verifyOrganizationMembership(organizationId, userId);

        Regulation regulation = new Regulation(
                organizationId,
                request.getTitle(),
                request.getJurisdiction(),
                request.getAuthority(),
                request.getCategory(),
                request.getStatus() != null ? request.getStatus() : Regulation.Status.ACTIVE,
                request.getPublicationDate() != null ? request.getPublicationDate() : Instant.now(),
                request.getEffectiveDate() != null ? request.getEffectiveDate() : Instant.now(),
                request.getSourceId(),
                userId
        );

        Regulation saved = regulationRepository.save(regulation);

        // Automatically create version 1
        String docRef = request.getInitialDocumentReference() != null ? request.getInitialDocumentReference() : "DOC-" + saved.getId() + "-v1";
        RegulationVersion v1 = new RegulationVersion(saved.getId(), 1, docRef, saved.getEffectiveDate(), userId);
        versionRepository.save(v1);

        log.info("Created Regulation ID: {} for Org: {}", saved.getId(), organizationId);
        return saved;
    }

    public Page<Regulation> getRegulations(String organizationId, String userId, String search, String jurisdiction, String authority, String status, Pageable pageable) {
        verifyOrganizationMembership(organizationId, userId);

        List<Regulation> allRegs = regulationRepository.findByOrganizationId(organizationId);

        // Filter in-memory for precise multi-attribute search and filtering
        List<Regulation> filtered = allRegs.stream()
                .filter(r -> {
                    if (jurisdiction != null && !jurisdiction.isBlank() && !"ALL".equalsIgnoreCase(jurisdiction)) {
                        if (!r.getJurisdiction().equalsIgnoreCase(jurisdiction)) return false;
                    }
                    if (authority != null && !authority.isBlank() && !"ALL".equalsIgnoreCase(authority)) {
                        if (!r.getAuthority().equalsIgnoreCase(authority)) return false;
                    }
                    if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                        if (!r.getStatus().name().equalsIgnoreCase(status)) return false;
                    }
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        boolean matchTitle = r.getTitle() != null && r.getTitle().toLowerCase().contains(s);
                        boolean matchCategory = r.getCategory() != null && r.getCategory().toLowerCase().contains(s);
                        boolean matchAuth = r.getAuthority() != null && r.getAuthority().toLowerCase().contains(s);
                        boolean matchJurisdiction = r.getJurisdiction() != null && r.getJurisdiction().toLowerCase().contains(s);
                        if (!matchTitle && !matchCategory && !matchAuth && !matchJurisdiction) return false;
                    }
                    return true;
                })
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());

        List<Regulation> pageContent = (start <= filtered.size()) ? filtered.subList(start, end) : Collections.emptyList();
        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    public Regulation getRegulationById(String organizationId, String userId, String id) {
        verifyOrganizationMembership(organizationId, userId);

        Regulation reg = regulationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Regulation not found with ID: " + id));

        if (!reg.getOrganizationId().equals(organizationId)) {
            throw new AccessDeniedException("Unauthorized access to regulation");
        }

        return reg;
    }

    public RegulationVersion createRegulationVersion(String organizationId, String userId, String regulationId, CreateRegulationVersionRequest request) {
        Regulation reg = getRegulationById(organizationId, userId, regulationId);

        Optional<RegulationVersion> topVersion = versionRepository.findTopByRegulationIdOrderByVersionNumberDesc(regulationId);
        int newVersionNumber = topVersion.map(v -> v.getVersionNumber() + 1).orElse(1);

        RegulationVersion newVersion = new RegulationVersion(
                reg.getId(),
                newVersionNumber,
                request.getDocumentReference(),
                request.getEffectiveDate() != null ? request.getEffectiveDate() : Instant.now(),
                userId
        );

        RegulationVersion saved = versionRepository.save(newVersion);

        reg.setUpdatedAt(Instant.now());
        regulationRepository.save(reg);

        log.info("Created RegulationVersion v{} for Regulation ID: {}", newVersionNumber, regulationId);
        return saved;
    }

    public List<RegulationVersion> getRegulationVersions(String organizationId, String userId, String regulationId) {
        getRegulationById(organizationId, userId, regulationId);
        return versionRepository.findByRegulationIdOrderByVersionNumberDesc(regulationId);
    }

    public RegulatoryRequirement addRequirement(String organizationId, String userId, String regulationId, CreateRequirementRequest request) {
        Regulation reg = getRegulationById(organizationId, userId, regulationId);

        String versionId = request.getRegulationVersionId();
        if (versionId == null || versionId.isBlank()) {
            Optional<RegulationVersion> latestVer = versionRepository.findTopByRegulationIdOrderByVersionNumberDesc(regulationId);
            if (latestVer.isPresent()) {
                versionId = latestVer.get().getId();
            }
        }

        RegulatoryRequirement req = new RegulatoryRequirement(
                reg.getId(),
                versionId,
                request.getRequirementText(),
                request.getSectionReference(),
                request.getApplicability(),
                request.getEffectiveDate() != null ? request.getEffectiveDate() : reg.getEffectiveDate(),
                request.getSourceReference(),
                userId
        );

        RegulatoryRequirement saved = requirementRepository.save(req);

        reg.setUpdatedAt(Instant.now());
        regulationRepository.save(reg);

        log.info("Created RegulatoryRequirement ID: {} for Regulation ID: {}", saved.getId(), regulationId);
        return saved;
    }

    public List<RegulatoryRequirement> getRequirements(String organizationId, String userId, String regulationId, String versionId) {
        getRegulationById(organizationId, userId, regulationId);

        if (versionId != null && !versionId.isBlank()) {
            return requirementRepository.findByRegulationIdAndRegulationVersionId(regulationId, versionId);
        }
        return requirementRepository.findByRegulationId(regulationId);
    }

    public RegulationMetricsResponse getMetrics(String organizationId, String userId) {
        verifyOrganizationMembership(organizationId, userId);

        long totalRegs = regulationRepository.countByOrganizationId(organizationId);
        long activeRegs = regulationRepository.countByOrganizationIdAndStatus(organizationId, Regulation.Status.ACTIVE);
        long draftRegs = regulationRepository.countByOrganizationIdAndStatus(organizationId, Regulation.Status.DRAFT);
        long supersededRegs = regulationRepository.countByOrganizationIdAndStatus(organizationId, Regulation.Status.SUPERSEDED);

        List<Regulation> regs = regulationRepository.findByOrganizationId(organizationId);
        List<String> regIds = regs.stream().map(Regulation::getId).collect(Collectors.toList());
        long totalReqs = regIds.isEmpty() ? 0 : requirementRepository.countByRegulationIdIn(regIds);

        return new RegulationMetricsResponse(totalRegs, activeRegs, draftRegs, supersededRegs, totalReqs);
    }
}
