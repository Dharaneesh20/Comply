package com.align.compliance.dto;

import com.align.compliance.model.ComplianceFinding;
import jakarta.validation.constraints.NotBlank;

public class CreateFindingRequest {

    private String requirementId;

    private String regulationId;

    private String sopId;

    private String sopVersionId;

    private ComplianceFinding.FindingType findingType = ComplianceFinding.FindingType.GAP;

    private ComplianceFinding.Severity severity = ComplianceFinding.Severity.MEDIUM;

    private double riskScore = 50.0;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String evidence;

    private String recommendedAction;

    private String assignedTo;

    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }

    public String getRegulationId() { return regulationId; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }

    public String getSopId() { return sopId; }
    public void setSopId(String sopId) { this.sopId = sopId; }

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

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
}
