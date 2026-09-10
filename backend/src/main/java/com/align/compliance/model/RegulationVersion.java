package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "regulation_versions")
@CompoundIndex(name = "reg_version_idx", def = "{'regulationId': 1, 'versionNumber': -1}")
public class RegulationVersion {

    @Id
    private String id;

    @Indexed
    private String regulationId;

    private int versionNumber;

    private String documentReference; // URL or document identifier/filename reference

    private Instant effectiveDate;

    private String createdBy;

    private Instant createdAt = Instant.now();

    public RegulationVersion() {}

    public RegulationVersion(String regulationId, int versionNumber, String documentReference, Instant effectiveDate, String createdBy) {
        this.regulationId = regulationId;
        this.versionNumber = versionNumber;
        this.documentReference = documentReference;
        this.effectiveDate = effectiveDate;
        this.createdBy = createdBy;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRegulationId() { return regulationId; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }

    public int getVersionNumber() { return versionNumber; }
    public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }

    public String getDocumentReference() { return documentReference; }
    public void setDocumentReference(String documentReference) { this.documentReference = documentReference; }

    public Instant getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(Instant effectiveDate) { this.effectiveDate = effectiveDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
