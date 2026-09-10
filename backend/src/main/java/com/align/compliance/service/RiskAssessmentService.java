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
public class RiskAssessmentService {

    private static final Logger log = LoggerFactory.getLogger(RiskAssessmentService.class);

    private final ComplianceFindingRepository findingRepository;
    private final ComplianceMappingRepository mappingRepository;
    private final RegulationRepository regulationRepository;
    private final RegulatoryRequirementRepository requirementRepository;
    private final SOPRepository sopRepository;
    private final OrganizationMemberRepository memberRepository;

    public RiskAssessmentService(
            ComplianceFindingRepository findingRepository,
            ComplianceMappingRepository mappingRepository,
            RegulationRepository regulationRepository,
            RegulatoryRequirementRepository requirementRepository,
            SOPRepository sopRepository,
            OrganizationMemberRepository memberRepository) {
        this.findingRepository = findingRepository;
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

    public ComplianceFinding createFinding(String organizationId, String userId, CreateFindingRequest request) {
        verifyOrganizationMembership(organizationId, userId);

        ComplianceFinding finding = new ComplianceFinding(
                organizationId,
                request.getRequirementId(),
                request.getRegulationId(),
                request.getSopId(),
                request.getSopVersionId(),
                request.getFindingType() != null ? request.getFindingType() : ComplianceFinding.FindingType.GAP,
                request.getSeverity() != null ? request.getSeverity() : ComplianceFinding.Severity.MEDIUM,
                request.getRiskScore() > 0 ? request.getRiskScore() : 50.0,
                request.getTitle(),
                request.getDescription(),
                request.getEvidence(),
                request.getRecommendedAction(),
                ComplianceFinding.Status.OPEN,
                request.getAssignedTo() != null ? request.getAssignedTo() : userId
        );

        ComplianceFinding saved = findingRepository.save(finding);
        log.info("Created ComplianceFinding ID: {} (Type: {}, Severity: {})", saved.getId(), saved.getFindingType(), saved.getSeverity());
        return saved;
    }

    /**
     * Deterministic Risk Engine: Scans all regulations, requirements, mappings, and SOPs
     * to evaluate gaps, partial coverage, missing controls, and outdated procedures.
     */
    public List<ComplianceFinding> evaluateComplianceFindings(String organizationId, String userId) {
        verifyOrganizationMembership(organizationId, userId);

        List<Regulation> regulations = regulationRepository.findByOrganizationId(organizationId);
        List<ComplianceFinding> generatedFindings = new ArrayList<>();

        for (Regulation reg : regulations) {
            List<RegulatoryRequirement> requirements = requirementRepository.findByRegulationId(reg.getId());

            for (RegulatoryRequirement req : requirements) {
                List<ComplianceMapping> mappings = mappingRepository.findByOrganizationId(organizationId).stream()
                        .filter(m -> m.getRequirementId().equals(req.getId()) && m.getStatus() == ComplianceMapping.MappingStatus.ACTIVE)
                        .collect(Collectors.toList());

                // Rule 1: No SOP mapped to an active requirement clause -> HIGH severity GAP
                if (mappings.isEmpty()) {
                    ComplianceFinding finding = upsertDeterministicFinding(
                            organizationId,
                            req.getId(),
                            reg.getId(),
                            null,
                            null,
                            ComplianceFinding.FindingType.GAP,
                            ComplianceFinding.Severity.HIGH,
                            75.0,
                            "Potential compliance gap detected for " + req.getSectionReference(),
                            "No operational Standard Operating Procedure document is mapped to requirement clause " + req.getSectionReference() + " (" + reg.getTitle() + ").",
                            "Requirement Text: \"" + req.getRequirementText() + "\"",
                            "Draft and publish an operational SOP addressing " + req.getSectionReference() + " and establish mapping.",
                            userId
                    );
                    generatedFindings.add(finding);
                    continue;
                }

                for (ComplianceMapping map : mappings) {
                    Optional<SOP> sopOpt = sopRepository.findById(map.getSopId());
                    if (sopOpt.isEmpty()) continue;
                    SOP sop = sopOpt.get();

                    // Rule 2: Requirement partially covered -> MEDIUM severity
                    if (map.getMappingType() == ComplianceMapping.MappingType.PARTIAL) {
                        ComplianceFinding finding = upsertDeterministicFinding(
                                organizationId,
                                req.getId(),
                                reg.getId(),
                                sop.getId(),
                                map.getSopVersionId(),
                                ComplianceFinding.FindingType.PARTIAL_COVERAGE,
                                ComplianceFinding.Severity.MEDIUM,
                                50.0,
                                "Potential partial coverage identified for " + req.getSectionReference(),
                                "SOP \"" + sop.getTitle() + "\" provides partial operational coverage for requirement clause " + req.getSectionReference() + ".",
                                "Mapping Type: PARTIAL. Notes: " + (map.getNotes() != null ? map.getNotes() : "N/A"),
                                "Review SOP procedures to expand operational coverage to 100%.",
                                userId
                        );
                        generatedFindings.add(finding);
                    }

                    // Rule 3: Missing control (NOT_IMPLEMENTED) -> CRITICAL severity
                    else if (map.getMappingType() == ComplianceMapping.MappingType.NOT_IMPLEMENTED) {
                        ComplianceFinding finding = upsertDeterministicFinding(
                                organizationId,
                                req.getId(),
                                reg.getId(),
                                sop.getId(),
                                map.getSopVersionId(),
                                ComplianceFinding.FindingType.MISSING_CONTROL,
                                ComplianceFinding.Severity.CRITICAL,
                                90.0,
                                "Potential missing control identified for " + req.getSectionReference(),
                                "Requirement clause " + req.getSectionReference() + " is flagged as NOT_IMPLEMENTED in SOP \"" + sop.getTitle() + "\".",
                                "Mapping Type: NOT_IMPLEMENTED.",
                                "Implement required procedural controls immediately and assign compliance reviewer.",
                                userId
                        );
                        generatedFindings.add(finding);
                    }

                    // Rule 4: SOP version older than applicable regulation effective date -> HIGH severity
                    if (reg.getEffectiveDate() != null && sop.getUpdatedAt() != null && sop.getUpdatedAt().isBefore(reg.getEffectiveDate())) {
                        ComplianceFinding finding = upsertDeterministicFinding(
                                organizationId,
                                req.getId(),
                                reg.getId(),
                                sop.getId(),
                                map.getSopVersionId(),
                                ComplianceFinding.FindingType.OUTDATED_SOP,
                                ComplianceFinding.Severity.HIGH,
                                70.0,
                                "Potential outdated SOP procedure identified for " + req.getSectionReference(),
                                "SOP \"" + sop.getTitle() + "\" was last updated on " + sop.getUpdatedAt().toString() + ", prior to regulation effective date " + reg.getEffectiveDate().toString() + ".",
                                "SOP Last Updated: " + sop.getUpdatedAt().toString() + " < Regulation Effective: " + reg.getEffectiveDate().toString(),
                                "Review and publish an updated version of SOP \"" + sop.getTitle() + "\" to align with updated statutory guidelines.",
                                userId
                        );
                        generatedFindings.add(finding);
                    }
                }
            }
        }

        log.info("Risk Engine evaluated {} findings for Organization ID: {}", generatedFindings.size(), organizationId);
        return generatedFindings;
    }

    private ComplianceFinding upsertDeterministicFinding(
            String organizationId,
            String requirementId,
            String regulationId,
            String sopId,
            String sopVersionId,
            ComplianceFinding.FindingType type,
            ComplianceFinding.Severity severity,
            double riskScore,
            String title,
            String description,
            String evidence,
            String recommendedAction,
            String userId) {

        Optional<ComplianceFinding> existing = findingRepository.findByOrganizationIdAndRequirementIdAndSopIdAndFindingType(
                organizationId,
                requirementId,
                sopId != null ? sopId : "NONE",
                type
        );

        if (existing.isPresent()) {
            ComplianceFinding f = existing.get();
            f.setSeverity(severity);
            f.setRiskScore(riskScore);
            f.setTitle(title);
            f.setDescription(description);
            f.setEvidence(evidence);
            f.setRecommendedAction(recommendedAction);
            f.setUpdatedAt(Instant.now());
            return findingRepository.save(f);
        }

        ComplianceFinding finding = new ComplianceFinding(
                organizationId,
                requirementId,
                regulationId,
                sopId != null ? sopId : "NONE",
                sopVersionId,
                type,
                severity,
                riskScore,
                title,
                description,
                evidence,
                recommendedAction,
                ComplianceFinding.Status.OPEN,
                userId
        );

        return findingRepository.save(finding);
    }

    public Page<FindingResponse> getFindings(
            String organizationId,
            String userId,
            String search,
            String severity,
            String status,
            String department,
            String sopId,
            String regulationId,
            Pageable pageable) {

        verifyOrganizationMembership(organizationId, userId);

        List<ComplianceFinding> allFindings = findingRepository.findByOrganizationId(organizationId);

        List<FindingResponse> resolved = allFindings.stream()
                .filter(f -> {
                    if (severity != null && !severity.isBlank() && !"ALL".equalsIgnoreCase(severity)) {
                        if (!f.getSeverity().name().equalsIgnoreCase(severity)) return false;
                    }
                    if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                        if (!f.getStatus().name().equalsIgnoreCase(status)) return false;
                    }
                    if (sopId != null && !sopId.isBlank() && !sopId.equals(f.getSopId())) return false;
                    if (regulationId != null && !regulationId.isBlank() && !regulationId.equals(f.getRegulationId())) return false;
                    
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        boolean matchTitle = f.getTitle() != null && f.getTitle().toLowerCase().contains(s);
                        boolean matchDesc = f.getDescription() != null && f.getDescription().toLowerCase().contains(s);
                        if (!matchTitle && !matchDesc) return false;
                    }
                    return true;
                })
                .map(f -> mapToFindingResponse(f, department))
                .filter(Objects::nonNull)
                .filter(res -> {
                    if (department != null && !department.isBlank() && !"ALL".equalsIgnoreCase(department)) {
                        return res.getDepartment() != null && res.getDepartment().equalsIgnoreCase(department);
                    }
                    return true;
                })
                .sorted((a, b) -> Double.compare(b.getRiskScore(), a.getRiskScore()))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), resolved.size());

        List<FindingResponse> pageContent = (start <= resolved.size()) ? resolved.subList(start, end) : Collections.emptyList();
        return new PageImpl<>(pageContent, pageable, resolved.size());
    }

    public FindingResponse getFindingById(String organizationId, String userId, String id) {
        verifyOrganizationMembership(organizationId, userId);

        ComplianceFinding finding = findingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Compliance finding not found with ID: " + id));

        if (!finding.getOrganizationId().equals(organizationId)) {
            throw new AccessDeniedException("Unauthorized access to compliance finding");
        }

        return mapToFindingResponse(finding, null);
    }

    public FindingResponse updateFinding(String organizationId, String userId, String id, UpdateFindingRequest request) {
        verifyOrganizationMembership(organizationId, userId);

        ComplianceFinding finding = findingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Compliance finding not found with ID: " + id));

        if (!finding.getOrganizationId().equals(organizationId)) {
            throw new AccessDeniedException("Unauthorized access to compliance finding");
        }

        if (request.getTitle() != null) finding.setTitle(request.getTitle());
        if (request.getDescription() != null) finding.setDescription(request.getDescription());
        if (request.getSeverity() != null) finding.setSeverity(request.getSeverity());
        if (request.getRiskScore() != null && request.getRiskScore() > 0) finding.setRiskScore(request.getRiskScore());
        if (request.getEvidence() != null) finding.setEvidence(request.getEvidence());
        if (request.getRecommendedAction() != null) finding.setRecommendedAction(request.getRecommendedAction());
        if (request.getAssignedTo() != null) finding.setAssignedTo(request.getAssignedTo());

        finding.setUpdatedAt(Instant.now());
        ComplianceFinding saved = findingRepository.save(finding);
        return mapToFindingResponse(saved, null);
    }

    public FindingResponse updateFindingStatus(String organizationId, String userId, String id, UpdateFindingStatusRequest request) {
        verifyOrganizationMembership(organizationId, userId);

        ComplianceFinding finding = findingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Compliance finding not found with ID: " + id));

        if (!finding.getOrganizationId().equals(organizationId)) {
            throw new AccessDeniedException("Unauthorized access to compliance finding");
        }

        finding.setStatus(request.getStatus());
        finding.setUpdatedAt(Instant.now());

        if (request.getStatus() == ComplianceFinding.Status.RESOLVED) {
            finding.setResolvedAt(Instant.now());
        }

        ComplianceFinding saved = findingRepository.save(finding);
        return mapToFindingResponse(saved, null);
    }

    public FindingMetricsResponse getMetrics(String organizationId, String userId) {
        verifyOrganizationMembership(organizationId, userId);

        List<ComplianceFinding.Status> openStatuses = Arrays.asList(
                ComplianceFinding.Status.OPEN,
                ComplianceFinding.Status.UNDER_REVIEW
        );

        long totalOpen = findingRepository.countByOrganizationIdAndStatusIn(organizationId, openStatuses);
        long criticalCount = findingRepository.countByOrganizationIdAndSeverity(organizationId, ComplianceFinding.Severity.CRITICAL);
        long highCount = findingRepository.countByOrganizationIdAndSeverity(organizationId, ComplianceFinding.Severity.HIGH);
        long mediumCount = findingRepository.countByOrganizationIdAndSeverity(organizationId, ComplianceFinding.Severity.MEDIUM);
        long lowCount = findingRepository.countByOrganizationIdAndSeverity(organizationId, ComplianceFinding.Severity.LOW);
        long totalResolved = findingRepository.countByOrganizationIdAndStatus(organizationId, ComplianceFinding.Status.RESOLVED);

        return new FindingMetricsResponse(totalOpen, criticalCount, highCount, mediumCount, lowCount, totalResolved);
    }

    private FindingResponse mapToFindingResponse(ComplianceFinding f, String deptFilter) {
        FindingResponse res = new FindingResponse();
        res.setId(f.getId());
        res.setOrganizationId(f.getOrganizationId());
        res.setRequirementId(f.getRequirementId());
        res.setRegulationId(f.getRegulationId());
        res.setSopId(f.getSopId());
        res.setSopVersionId(f.getSopVersionId());
        res.setFindingType(f.getFindingType());
        res.setSeverity(f.getSeverity());
        res.setRiskScore(f.getRiskScore());
        res.setTitle(f.getTitle());
        res.setDescription(f.getDescription());
        res.setEvidence(f.getEvidence());
        res.setRecommendedAction(f.getRecommendedAction());
        res.setStatus(f.getStatus());
        res.setAssignedTo(f.getAssignedTo());
        res.setCreatedAt(f.getCreatedAt().toString());
        res.setUpdatedAt(f.getUpdatedAt().toString());
        if (f.getResolvedAt() != null) res.setResolvedAt(f.getResolvedAt().toString());

        // Resolve Regulation Details
        if (f.getRegulationId() != null) {
            regulationRepository.findById(f.getRegulationId()).ifPresent(reg -> {
                res.setRegulationTitle(reg.getTitle());
                res.setJurisdiction(reg.getJurisdiction());
                res.setAuthority(reg.getAuthority());
            });
        }

        // Resolve Requirement Details
        if (f.getRequirementId() != null) {
            requirementRepository.findById(f.getRequirementId()).ifPresent(req -> {
                res.setSectionReference(req.getSectionReference());
                res.setRequirementText(req.getRequirementText());
            });
        }

        // Resolve SOP Details
        if (f.getSopId() != null && !"NONE".equals(f.getSopId())) {
            sopRepository.findById(f.getSopId()).ifPresent(sop -> {
                res.setSopTitle(sop.getTitle());
                res.setDepartment(sop.getDepartment());
            });
        }

        return res;
    }
}
