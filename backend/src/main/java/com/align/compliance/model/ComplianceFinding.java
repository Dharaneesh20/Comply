package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "compliance_findings")
@CompoundIndexes({
    @CompoundIndex(name = "org_finding_unique_idx", def = "{'organizationId': 1, 'requirementId': 1, 'sopId': 1, 'findingType': 1}", unique = true),
    @CompoundIndex(name = "org_status_severity_idx", def = "{'organizationId': 1, 'status': 1, 'severity': 1}"),
    @CompoundIndex(name = "org_updated_idx", def = "{'organizationId': 1, 'updatedAt': -1}")
})
public class ComplianceFinding {

    public enum FindingType {
        GAP,
        OUTDATED_SOP,
        MISSING_CONTROL,
        PARTIAL_COVERAGE,
        CONFLICTING_PROCEDURE
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum Status {
        OPEN,
        UNDER_REVIEW,
        ACCEPTED,
        RESOLVED,
        DISMISSED
    }

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String requirementId;

    @Indexed
    private String regulationId;

    @Indexed
    private String sopId;

    private String sopVersionId;

    @Indexed
    private FindingType findingType = FindingType.GAP;

    @Indexed
    private Severity severity = Severity.MEDIUM;

    private double riskScore = 50.0; // 0 to 100

    private String title;

    private String description;

    private String evidence;

    private String recommendedAction;

    @Indexed
    private Status status = Status.OPEN;

    private String assignedTo;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    private Instant resolvedAt;

    public ComplianceFinding() {}

    public ComplianceFinding(String organizationId, String requirementId, String regulationId, String sopId, String sopVersionId, FindingType findingType, Severity severity, double riskScore, String title, String description, String evidence, String recommendedAction, Status status, String assignedTo) {
        this.organizationId = organizationId;
        this.requirementId = requirementId;
        this.regulationId = regulationId;
        this.sopId = sopId;
        this.sopVersionId = sopVersionId;
        this.findingType = findingType != null ? findingType : FindingType.GAP;
        this.severity = severity != null ? severity : Severity.MEDIUM;
        this.riskScore = riskScore;
        this.title = title;
        this.description = description;
        this.evidence = evidence;
        this.recommendedAction = recommendedAction;
        this.status = status != null ? status : Status.OPEN;
        this.assignedTo = assignedTo;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }

    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }

    public String getRegulationId() { return regulationId; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }

    public String getSopId() { return sopId; }
    public void setSopId(String sopId) { this.sopId = sopId; }

    public String getSopVersionId() { return sopVersionId; }
    public void setSopVersionId(String sopVersionId) { this.sopVersionId = sopVersionId; }

    public FindingType getFindingType() { return findingType; }
    public void setFindingType(FindingType findingType) { this.findingType = findingType; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public double getRiskScore() { return riskScore; }
    public void setRiskScore(double riskScore) { this.riskScore = riskScore; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
