package com.align.compliance.dto;

import com.align.compliance.model.ComplianceMapping;

public class MappedRequirementDetailResponse {

    private String mappingId;
    private String regulationId;
    private String regulationTitle;
    private String jurisdiction;
    private String authority;
    private String requirementId;
    private String sectionReference;
    private String requirementText;
    private String applicability;
    private ComplianceMapping.MappingType mappingType;
    private double confidence;
    private ComplianceMapping.MappingStatus status;
    private String notes;
    private String createdBy;
    private String createdAt;

    public MappedRequirementDetailResponse() {}

    public String getMappingId() { return mappingId; }
    public void setMappingId(String mappingId) { this.mappingId = mappingId; }

    public String getRegulationId() { return regulationId; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }

    public String getRegulationTitle() { return regulationTitle; }
    public void setRegulationTitle(String regulationTitle) { this.regulationTitle = regulationTitle; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public String getAuthority() { return authority; }
    public void setAuthority(String authority) { this.authority = authority; }

    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }

    public String getSectionReference() { return sectionReference; }
    public void setSectionReference(String sectionReference) { this.sectionReference = sectionReference; }

    public String getRequirementText() { return requirementText; }
    public void setRequirementText(String requirementText) { this.requirementText = requirementText; }

    public String getApplicability() { return applicability; }
    public void setApplicability(String applicability) { this.applicability = applicability; }

    public ComplianceMapping.MappingType getMappingType() { return mappingType; }
    public void setMappingType(ComplianceMapping.MappingType mappingType) { this.mappingType = mappingType; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public ComplianceMapping.MappingStatus getStatus() { return status; }
    public void setStatus(ComplianceMapping.MappingStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
