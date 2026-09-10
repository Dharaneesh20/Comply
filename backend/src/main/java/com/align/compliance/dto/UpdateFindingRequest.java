package com.align.compliance.dto;

import com.align.compliance.model.ComplianceFinding;

public class UpdateFindingRequest {

    private String title;
    private String description;
    private ComplianceFinding.Severity severity;
    private Double riskScore;
    private String evidence;
    private String recommendedAction;
    private String assignedTo;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ComplianceFinding.Severity getSeverity() { return severity; }
    public void setSeverity(ComplianceFinding.Severity severity) { this.severity = severity; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
}
