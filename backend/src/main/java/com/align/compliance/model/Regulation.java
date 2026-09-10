package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "regulations")
@CompoundIndexes({
    @CompoundIndex(name = "org_jurisdiction_idx", def = "{'organizationId': 1, 'jurisdiction': 1}"),
    @CompoundIndex(name = "org_authority_idx", def = "{'organizationId': 1, 'authority': 1}"),
    @CompoundIndex(name = "org_status_idx", def = "{'organizationId': 1, 'status': 1}"),
    @CompoundIndex(name = "org_updated_idx", def = "{'organizationId': 1, 'updatedAt': -1}")
})
public class Regulation {

    public enum Status {
        ACTIVE,
        DRAFT,
        SUPERSEDED,
        ARCHIVED
    }

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String title;

    @Indexed
    private String jurisdiction; // e.g., "US", "EU", "Global", "California"

    @Indexed
    private String authority; // e.g., "FDA", "SEC", "HIPAA", "EU GDPR", "ISO"

    private String category; // e.g., "Data Privacy", "Cybersecurity", "Healthcare", "Financial"

    @Indexed
    private Status status = Status.ACTIVE;

    private Instant publicationDate;

    private Instant effectiveDate;

    private String sourceId;

    private String createdBy;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public Regulation() {}

    public Regulation(String organizationId, String title, String jurisdiction, String authority, String category, Status status, Instant publicationDate, Instant effectiveDate, String sourceId, String createdBy) {
        this.organizationId = organizationId;
        this.title = title;
        this.jurisdiction = jurisdiction;
        this.authority = authority;
        this.category = category;
        this.status = status != null ? status : Status.ACTIVE;
        this.publicationDate = publicationDate;
        this.effectiveDate = effectiveDate;
        this.sourceId = sourceId;
        this.createdBy = createdBy;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public String getAuthority() { return authority; }
    public void setAuthority(String authority) { this.authority = authority; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Instant getPublicationDate() { return publicationDate; }
    public void setPublicationDate(Instant publicationDate) { this.publicationDate = publicationDate; }

    public Instant getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(Instant effectiveDate) { this.effectiveDate = effectiveDate; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
