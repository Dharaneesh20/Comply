package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "sop_approvals")
@CompoundIndexes({
    @CompoundIndex(name = "org_sop_approval_idx", def = "{'organizationId': 1, 'sopId': 1}")
})
public class SOPApproval {

    public enum Status {
        APPROVED,
        REJECTED
    }

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String sopId;

    private String sopVersionId;
    private String approverId;
    private String approvalNotes;
    private Status status;
    private Instant createdAt;

    public SOPApproval() {
        this.status = Status.APPROVED;
        this.createdAt = Instant.now();
    }

    public SOPApproval(String organizationId, String sopId, String sopVersionId, String approverId, String approvalNotes, Status status) {
        this.organizationId = organizationId;
        this.sopId = sopId;
        this.sopVersionId = sopVersionId;
        this.approverId = approverId;
        this.approvalNotes = approvalNotes;
        this.status = status != null ? status : Status.APPROVED;
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

    public String getApproverId() {
        return approverId;
    }

    public void setApproverId(String approverId) {
        this.approverId = approverId;
    }

    public String getApprovalNotes() {
        return approvalNotes;
    }

    public void setApprovalNotes(String approvalNotes) {
        this.approvalNotes = approvalNotes;
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
