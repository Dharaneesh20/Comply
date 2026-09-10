package com.align.compliance.dto;

import com.align.compliance.model.ComplianceMapping;
import jakarta.validation.constraints.NotBlank;

public class CreateMappingRequest {

    @NotBlank(message = "Regulation ID is required")
    private String regulationId;

    private String regulationVersionId;

    @NotBlank(message = "Requirement ID is required")
    private String requirementId;

    @NotBlank(message = "SOP ID is required")
    private String sopId;

    private String sopVersionId;

    private ComplianceMapping.MappingType mappingType = ComplianceMapping.MappingType.FULL;

    private double confidence = 1.0;

    private String notes;

    public String getRegulationId() { return regulationId; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }

    public String getRegulationVersionId() { return regulationVersionId; }
    public void setRegulationVersionId(String regulationVersionId) { this.regulationVersionId = regulationVersionId; }

    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }

    public String getSopId() { return sopId; }
    public void setSopId(String sopId) { this.sopId = sopId; }

    public String getSopVersionId() { return sopVersionId; }
    public void setSopVersionId(String sopVersionId) { this.sopVersionId = sopVersionId; }

    public ComplianceMapping.MappingType getMappingType() { return mappingType; }
    public void setMappingType(ComplianceMapping.MappingType mappingType) { this.mappingType = mappingType; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
