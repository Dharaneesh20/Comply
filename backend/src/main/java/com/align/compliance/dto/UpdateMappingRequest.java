package com.align.compliance.dto;

import com.align.compliance.model.ComplianceMapping;

public class UpdateMappingRequest {

    private ComplianceMapping.MappingType mappingType;
    private Double confidence;
    private ComplianceMapping.MappingStatus status;
    private String notes;
    private String sopVersionId;

    public ComplianceMapping.MappingType getMappingType() { return mappingType; }
    public void setMappingType(ComplianceMapping.MappingType mappingType) { this.mappingType = mappingType; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public ComplianceMapping.MappingStatus getStatus() { return status; }
    public void setStatus(ComplianceMapping.MappingStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getSopVersionId() { return sopVersionId; }
    public void setSopVersionId(String sopVersionId) { this.sopVersionId = sopVersionId; }
}
