package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "sop_reviews")
@CompoundIndexes({
    @CompoundIndex(name = "org_sop_review_idx", def = "{'organizationId': 1, 'sopId': 1}")
})
public class SOPReview {

    public enum Status {
        PENDING,
        APPROVED,
        CHANGES_REQUESTED
    }

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String sopId;

    private String sopVersionId;
    private String reviewerId;
    private String comments;
    private Status status;
    private Instant createdAt;

    public SOPReview() {
        this.status = Status.PENDING;
        this.createdAt = Instant.now();
    }

    public SOPReview(String organizationId, String sopId, String sopVersionId, String reviewerId, String comments, Status status) {
        this.organizationId = organizationId;
        this.sopId = sopId;
        this.sopVersionId = sopVersionId;
        this.reviewerId = reviewerId;
        this.comments = comments;
        this.status = status != null ? status : Status.PENDING;
        this.createdAt = Instant.now();
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

    public String getSopId() {
        return sopId;
    }

    public void setSopId(String sopId) {
        this.sopId = sopId;
    }

    public String getSopVersionId() {
        return sopVersionId;
    }

    public void setSopVersionId(String sopVersionId) {
        this.sopVersionId = sopVersionId;
    }

    public String getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(String reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
