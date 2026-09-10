package com.align.compliance.model;

import com.align.compliance.dto.DocumentMetadata;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "sops")
@CompoundIndexes({
        @CompoundIndex(name = "org_idx", def = "{'organizationId': 1}"),
        @CompoundIndex(name = "org_status_idx", def = "{'organizationId': 1, 'status': 1}"),
        @CompoundIndex(name = "org_dept_idx", def = "{'organizationId': 1, 'department': 1}"),
        @CompoundIndex(name = "org_updated_idx", def = "{'organizationId': 1, 'updatedAt': -1}")
})
public class SOP {

    @Id
    private String id;

    @Indexed
    @Field("organization_id")
    private String organizationId;

    private String title;

    private String description;

    private String department;

    @Field("owner_id")
    private String ownerId;

    private String status = "DRAFT"; // DRAFT, PUBLISHED, ARCHIVED, UNDER_REVIEW

    @Field("current_version")
    private int currentVersion = 1;

    @Field("current_document_metadata")
    private DocumentMetadata currentDocumentMetadata;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    @Field("updated_at")
    private Instant updatedAt = Instant.now();

    @Field("last_reviewed_at")
    private Instant lastReviewedAt;

    @Field("next_review_at")
    private Instant nextReviewAt;

    public SOP() {
    }

    public SOP(String organizationId, String title, String description, String department, String ownerId) {
        this.organizationId = organizationId;
        this.title = title;
        this.description = description;
        this.department = department;
        this.ownerId = ownerId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getCurrentVersion() {
        return currentVersion;
    }

    public void setCurrentVersion(int currentVersion) {
        this.currentVersion = currentVersion;
    }

    public DocumentMetadata getCurrentDocumentMetadata() {
        return currentDocumentMetadata;
    }

    public void setCurrentDocumentMetadata(DocumentMetadata currentDocumentMetadata) {
        this.currentDocumentMetadata = currentDocumentMetadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getLastReviewedAt() {
        return lastReviewedAt;
    }

    public void setLastReviewedAt(Instant lastReviewedAt) {
        this.lastReviewedAt = lastReviewedAt;
    }

    public Instant getNextReviewAt() {
        return nextReviewAt;
    }

    public void setNextReviewAt(Instant nextReviewAt) {
        this.nextReviewAt = nextReviewAt;
    }
}
