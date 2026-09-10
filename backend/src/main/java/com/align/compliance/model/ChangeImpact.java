package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "change_impacts")
@CompoundIndexes({
    @CompoundIndex(name = "org_change_impact_idx", def = "{'organizationId': 1, 'changeId': 1}"),
    @CompoundIndex(name = "org_sop_impact_idx", def = "{'organizationId': 1, 'sopId': 1}")
})
public class ChangeImpact {

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String changeId;

    private String requirementId;
    private String sopId;
    private String sopTitle;
    private String sopVersionId;
    private String assignedDepartment;
    private String impactLevel; // CRITICAL, HIGH, MEDIUM, LOW
    private String reason;
    private String requiredAction;
    private String status; // PENDING_REVIEW, UNDER_REVIEW, SOP_REVISED, NO_ACTION_NEEDED
    private Instant createdAt;
    private Instant updatedAt;

    public ChangeImpact() {
        this.status = "PENDING_REVIEW";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public ChangeImpact(String organizationId, String changeId, String requirementId, String sopId, String sopTitle, String sopVersionId, String assignedDepartment, String impactLevel, String reason, String requiredAction) {
        this.organizationId = organizationId;
        this.changeId = changeId;
        this.requirementId = requirementId;
        this.sopId = sopId;
        this.sopTitle = sopTitle;
        this.sopVersionId = sopVersionId;
        this.assignedDepartment = assignedDepartment;
        this.impactLevel = impactLevel;
        this.reason = reason;
        this.requiredAction = requiredAction;
        this.status = "PENDING_REVIEW";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
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

    public String getChangeId() {
        return changeId;
    }

    public void setChangeId(String changeId) {
        this.changeId = changeId;
    }

    public String getRequirementId() {
        return requirementId;
    }

    public void setRequirementId(String requirementId) {
        this.requirementId = requirementId;
    }

    public String getSopId() {
        return sopId;
    }

    public void setSopId(String sopId) {
        this.sopId = sopId;
    }

    public String getSopTitle() {
        return sopTitle;
    }

    public void setSopTitle(String sopTitle) {
        this.sopTitle = sopTitle;
    }

    public String getSopVersionId() {
        return sopVersionId;
    }

    public void setSopVersionId(String sopVersionId) {
        this.sopVersionId = sopVersionId;
    }

    public String getAssignedDepartment() {
        return assignedDepartment;
    }

    public void setAssignedDepartment(String assignedDepartment) {
        this.assignedDepartment = assignedDepartment;
    }

    public String getImpactLevel() {
        return impactLevel;
    }

    public void setImpactLevel(String impactLevel) {
        this.impactLevel = impactLevel;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRequiredAction() {
        return requiredAction;
    }

    public void setRequiredAction(String requiredAction) {
        this.requiredAction = requiredAction;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
}
