package com.align.compliance.dto;

import com.align.compliance.model.ComplianceFinding;

public class FindingResponse {

    private String id;
    private String organizationId;
    private String requirementId;
    private String sectionReference;
    private String requirementText;
    private String regulationId;
    private String regulationTitle;
    private String jurisdiction;
    private String authority;
    private String sopId;
    private String sopTitle;
    private String department;
    private String sopVersionId;
    private ComplianceFinding.FindingType findingType;
    private ComplianceFinding.Severity severity;
    private double riskScore;
    private String title;
    private String description;
    private String evidence;
    private String recommendedAction;
    private ComplianceFinding.Status status;
    private String assignedTo;
    private String createdAt;
    private String updatedAt;
    private String resolvedAt;

    public FindingResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }

    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }

    public String getSectionReference() { return sectionReference; }
    public void setSectionReference(String sectionReference) { this.sectionReference = sectionReference; }

    public String getRequirementText() { return requirementText; }
    public void setRequirementText(String requirementText) { this.requirementText = requirementText; }

    public String getRegulationId() { return regulationId; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }

    public String getRegulationTitle() { return regulationTitle; }
    public void setRegulationTitle(String regulationTitle) { this.regulationTitle = regulationTitle; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public String getAuthority() { return authority; }
    public void setAuthority(String authority) { this.authority = authority; }

    public String getSopId() { return sopId; }
    public void setSopId(String sopId) { this.sopId = sopId; }

    public String getSopTitle() { return sopTitle; }
    public void setSopTitle(String sopTitle) { this.sopTitle = sopTitle; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSopVersionId() { return sopVersionId; }
    public void setSopVersionId(String sopVersionId) { this.sopVersionId = sopVersionId; }

    public ComplianceFinding.FindingType getFindingType() { return findingType; }
    public void setFindingType(ComplianceFinding.FindingType findingType) { this.findingType = findingType; }

    public ComplianceFinding.Severity getSeverity() { return severity; }
    public void setSeverity(ComplianceFinding.Severity severity) { this.severity = severity; }

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

    public ComplianceFinding.Status getStatus() { return status; }
    public void setStatus(ComplianceFinding.Status status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }
}
