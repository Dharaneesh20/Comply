package com.align.compliance.dto;

import com.align.compliance.model.Regulation;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class CreateRegulationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Jurisdiction is required")
    private String jurisdiction;

    @NotBlank(message = "Authority is required")
    private String authority;

    @NotBlank(message = "Category is required")
    private String category;

    private Regulation.Status status = Regulation.Status.ACTIVE;

    private Instant publicationDate;

    private Instant effectiveDate;

    private String sourceId;

    private String initialDocumentReference;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public String getAuthority() { return authority; }
    public void setAuthority(String authority) { this.authority = authority; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Regulation.Status getStatus() { return status; }
    public void setStatus(Regulation.Status status) { this.status = status; }

    public Instant getPublicationDate() { return publicationDate; }
    public void setPublicationDate(Instant publicationDate) { this.publicationDate = publicationDate; }

    public Instant getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(Instant effectiveDate) { this.effectiveDate = effectiveDate; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public String getInitialDocumentReference() { return initialDocumentReference; }
    public void setInitialDocumentReference(String initialDocumentReference) { this.initialDocumentReference = initialDocumentReference; }
}
