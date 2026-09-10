package com.align.compliance.service;

import com.align.compliance.dto.*;
import com.align.compliance.exception.ResourceNotFoundException;
import com.align.compliance.model.*;
import com.align.compliance.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class RemediationService {

    private static final Logger log = LoggerFactory.getLogger(RemediationService.class);

    private final RemediationTaskRepository taskRepository;
    private final SOPReviewRepository reviewRepository;
    private final SOPApprovalRepository approvalRepository;
    private final ComplianceFindingRepository findingRepository;
    private final SOPRepository sopRepository;
    private final SOPVersionRepository versionRepository;

    public RemediationService(
            RemediationTaskRepository taskRepository,
            SOPReviewRepository reviewRepository,
            SOPApprovalRepository approvalRepository,
            ComplianceFindingRepository findingRepository,
            SOPRepository sopRepository,
            SOPVersionRepository versionRepository) {
        this.taskRepository = taskRepository;
        this.reviewRepository = reviewRepository;
        this.approvalRepository = approvalRepository;
        this.findingRepository = findingRepository;
        this.sopRepository = sopRepository;
        this.versionRepository = versionRepository;
    }

    public RemediationTask createRemediation(String organizationId, CreateRemediationRequest request) {
        ComplianceFinding finding = null;
        if (request.getFindingId() != null && !request.getFindingId().isEmpty()) {
            finding = findingRepository.findById(request.getFindingId())
                    .filter(f -> f.getOrganizationId().equals(organizationId))
                    .orElseThrow(() -> new ResourceNotFoundException("Finding not found: " + request.getFindingId()));
            
            // Transition finding status to UNDER_REVIEW
            finding.setStatus(ComplianceFinding.Status.UNDER_REVIEW);
            findingRepository.save(finding);
        }

        String sopId = request.getSopId();
        if ((sopId == null || sopId.isEmpty()) && finding != null) {
            sopId = finding.getSopId();
        }

        RemediationTask task = new RemediationTask(
                organizationId,
                request.getFindingId(),
                sopId,
                request.getTitle(),
                request.getDescription(),
                request.getAssignedTo(),
                request.getPriority(),
                request.getDueDate()
        );

        return taskRepository.save(task);
    }

    public List<RemediationTask> getRemediations(String organizationId, String findingId, String sopId) {
        if (findingId != null && !findingId.isEmpty()) {
            return taskRepository.findByOrganizationIdAndFindingId(organizationId, findingId);
        }
        if (sopId != null && !sopId.isEmpty()) {
            return taskRepository.findByOrganizationIdAndSopId(organizationId, sopId);
        }
        return taskRepository.findByOrganizationId(organizationId);
    }

    public RemediationTask getRemediationById(String organizationId, String id) {
        return taskRepository.findById(id)
                .filter(t -> t.getOrganizationId().equals(organizationId))
                .orElseThrow(() -> new ResourceNotFoundException("Remediation task not found: " + id));
    }

    public RemediationTask updateRemediation(String organizationId, String id, UpdateRemediationRequest request) {
        RemediationTask task = getRemediationById(organizationId, id);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getAssignedTo() != null) task.setAssignedTo(request.getAssignedTo());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        return taskRepository.save(task);
    }

    public SOPReview submitSOPReview(String organizationId, String sopId, String currentUserId, ReviewSOPRequest request) {
        SOP sop = sopRepository.findById(sopId)
                .filter(s -> s.getOrganizationId().equals(organizationId))
                .orElseThrow(() -> new ResourceNotFoundException("SOP not found: " + sopId));

        SOPVersion version;
        if (request.getSopVersionId() != null && !request.getSopVersionId().isEmpty()) {
            version = versionRepository.findById(request.getSopVersionId()).orElse(null);
        } else {
            List<SOPVersion> versions = versionRepository.findBySopIdOrderByVersionNumberDesc(sopId);
            version = versions.isEmpty() ? null : versions.get(0);
        }

        if (version != null) {
            version.setWorkflowStatus(SOPVersion.WorkflowStatus.IN_REVIEW);
            versionRepository.save(version);
        }

        SOPReview.Status reviewStatus = SOPReview.Status.PENDING;
        if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
            reviewStatus = SOPReview.Status.APPROVED;
        } else if ("CHANGES_REQUESTED".equalsIgnoreCase(request.getStatus())) {
            reviewStatus = SOPReview.Status.CHANGES_REQUESTED;
        }

        SOPReview review = new SOPReview(
                organizationId,
                sopId,
                version != null ? version.getId() : "v" + sop.getCurrentVersion(),
                currentUserId,
                request.getComments(),
                reviewStatus
        );

        return reviewRepository.save(review);
    }

    public SOPApproval approveSOP(String organizationId, String sopId, String currentUserId, ApproveSOPRequest request) {
        SOP sop = sopRepository.findById(sopId)
                .filter(s -> s.getOrganizationId().equals(organizationId))
                .orElseThrow(() -> new ResourceNotFoundException("SOP not found: " + sopId));

        SOPVersion version;
        if (request.getSopVersionId() != null && !request.getSopVersionId().isEmpty()) {
            version = versionRepository.findById(request.getSopVersionId()).orElse(null);
        } else {
            List<SOPVersion> versions = versionRepository.findBySopIdOrderByVersionNumberDesc(sopId);
            version = versions.isEmpty() ? null : versions.get(0);
        }

        SOPApproval.Status approvalStatus = SOPApproval.Status.APPROVED;
        if ("REJECTED".equalsIgnoreCase(request.getStatus())) {
            approvalStatus = SOPApproval.Status.REJECTED;
        }

        if (version != null) {
            if (approvalStatus == SOPApproval.Status.APPROVED) {
                version.setWorkflowStatus(SOPVersion.WorkflowStatus.ACTIVE);
                sop.setCurrentVersion(version.getVersionNumber());
                sop.setLastReviewedAt(Instant.now());
                sopRepository.save(sop);
            } else {
                version.setWorkflowStatus(SOPVersion.WorkflowStatus.DRAFT);
            }
            versionRepository.save(version);
        }

        SOPApproval approval = new SOPApproval(
                organizationId,
                sopId,
                version != null ? version.getId() : "v" + sop.getCurrentVersion(),
                currentUserId,
                request.getApprovalNotes(),
                approvalStatus
        );

        // Auto-resolve any pending findings linked to this SOP upon approval
        if (approvalStatus == SOPApproval.Status.APPROVED) {
            List<ComplianceFinding> findings = findingRepository.findByOrganizationId(organizationId);
            for (ComplianceFinding finding : findings) {
                if (sopId.equals(finding.getSopId()) && finding.getStatus() != ComplianceFinding.Status.RESOLVED && finding.getStatus() != ComplianceFinding.Status.DISMISSED) {
                    finding.setStatus(ComplianceFinding.Status.RESOLVED);
                    finding.setResolvedAt(Instant.now());
                    findingRepository.save(finding);
                }
            }

            List<RemediationTask> tasks = taskRepository.findByOrganizationIdAndSopId(organizationId, sopId);
            for (RemediationTask task : tasks) {
                if (task.getStatus() != RemediationTask.Status.COMPLETED && task.getStatus() != RemediationTask.Status.CANCELLED) {
                    task.setStatus(RemediationTask.Status.COMPLETED);
                    taskRepository.save(task);
                }
            }
        }

        return approvalRepository.save(approval);
    }
}
