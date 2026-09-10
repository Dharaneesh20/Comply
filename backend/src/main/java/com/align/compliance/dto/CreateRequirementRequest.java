package com.align.compliance.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class CreateRequirementRequest {

    private String regulationVersionId;

    @NotBlank(message = "Requirement text is required")
    private String requirementText;

    @NotBlank(message = "Section reference is required")
    private String sectionReference;

    private String applicability;

    private Instant effectiveDate;

    private String sourceReference;

    public String getRegulationVersionId() { return regulationVersionId; }
    public void setRegulationVersionId(String regulationVersionId) { this.regulationVersionId = regulationVersionId; }

    public String getRequirementText() { return requirementText; }
    public void setRequirementText(String requirementText) { this.requirementText = requirementText; }

    public String getSectionReference() { return sectionReference; }
    public void setSectionReference(String sectionReference) { this.sectionReference = sectionReference; }

    public String getApplicability() { return applicability; }
    public void setApplicability(String applicability) { this.applicability = applicability; }

    public Instant getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(Instant effectiveDate) { this.effectiveDate = effectiveDate; }

    public String getSourceReference() { return sourceReference; }
    public void setSourceReference(String sourceReference) { this.sourceReference = sourceReference; }
}
