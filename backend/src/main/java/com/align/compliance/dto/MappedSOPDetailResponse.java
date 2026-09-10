package com.align.compliance.dto;

import com.align.compliance.model.ComplianceMapping;

public class MappedSOPDetailResponse {

    private String mappingId;
    private String sopId;
    private String sopTitle;
    private String department;
    private int currentVersion;
    private String mappedVersionId;
    private String requirementId;
    private String sectionReference;
    private ComplianceMapping.MappingType mappingType;
    private double confidence;
    private ComplianceMapping.MappingStatus status;
    private String notes;
    private String createdBy;
    private String createdAt;

    public MappedSOPDetailResponse() {}

    public String getMappingId() { return mappingId; }
    public void setMappingId(String mappingId) { this.mappingId = mappingId; }

    public String getSopId() { return sopId; }
    public void setSopId(String sopId) { this.sopId = sopId; }

    public String getSopTitle() { return sopTitle; }
    public void setSopTitle(String sopTitle) { this.sopTitle = sopTitle; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getCurrentVersion() { return currentVersion; }
    public void setCurrentVersion(int currentVersion) { this.currentVersion = currentVersion; }

    public String getMappedVersionId() { return mappedVersionId; }
    public void setMappedVersionId(String mappedVersionId) { this.mappedVersionId = mappedVersionId; }

    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }

    public String getSectionReference() { return sectionReference; }
    public void setSectionReference(String sectionReference) { this.sectionReference = sectionReference; }

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
