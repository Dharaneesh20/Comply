package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "ai_reviews")
@CompoundIndex(name = "org_analysis_idx", def = "{'organization_id': 1, 'analysis_id': 1}")
public class AIReview {

    @Id
    private String id;

    @Field("organization_id")
    private String organizationId;

    @Field("analysis_id")
    private String analysisId;

    @Field("reviewer_id")
    private String reviewerId;

    private String decision; // ACCEPT, REJECT, REVIEW

    private String comment;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public AIReview() {
    }

    public AIReview(String organizationId, String analysisId, String reviewerId, String decision, String comment) {
        this.organizationId = organizationId;
        this.analysisId = analysisId;
        this.reviewerId = reviewerId;
        this.decision = decision;
        this.comment = comment;
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

    public String getAnalysisId() {
        return analysisId;
    }

    public void setAnalysisId(String analysisId) {
        this.analysisId = analysisId;
    }

    public String getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(String reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
