package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "regulatory_requirements")
@CompoundIndexes({
    @CompoundIndex(name = "reg_req_idx", def = "{'regulationId': 1, 'sectionReference': 1}"),
    @CompoundIndex(name = "reg_ver_req_idx", def = "{'regulationId': 1, 'regulationVersionId': 1}")
})
public class RegulatoryRequirement {

    @Id
    private String id;

    @Indexed
    private String regulationId;

    @Indexed
    private String regulationVersionId;

    private String requirementText;

    private String sectionReference; // e.g., "Article 32(1)(a)", "Section 164.308(a)(1)"

    private String applicability; // e.g., "All Data Processors", "Covered Entities", "Healthcare Providers"

    private Instant effectiveDate;

    private String sourceReference; // e.g., "Official Journal L 119", "CFR Title 45"

    private String createdBy;

    private Instant createdAt = Instant.now();

    public RegulatoryRequirement() {}

    public RegulatoryRequirement(String regulationId, String regulationVersionId, String requirementText, String sectionReference, String applicability, Instant effectiveDate, String sourceReference, String createdBy) {
        this.regulationId = regulationId;
        this.regulationVersionId = regulationVersionId;
        this.requirementText = requirementText;
        this.sectionReference = sectionReference;
        this.applicability = applicability;
        this.effectiveDate = effectiveDate;
        this.sourceReference = sourceReference;
        this.createdBy = createdBy;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegulationId() { return regulationId; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }

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

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
