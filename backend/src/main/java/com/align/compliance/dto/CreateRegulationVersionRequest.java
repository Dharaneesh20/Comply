package com.align.compliance.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class CreateRegulationVersionRequest {

    @NotBlank(message = "Document reference is required")
    private String documentReference;

    private Instant effectiveDate;

    public String getDocumentReference() { return documentReference; }
    public void setDocumentReference(String documentReference) { this.documentReference = documentReference; }

    public Instant getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(Instant effectiveDate) { this.effectiveDate = effectiveDate; }
}
