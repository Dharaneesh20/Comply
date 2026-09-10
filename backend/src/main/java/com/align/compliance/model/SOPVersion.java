package com.align.compliance.model;

import com.align.compliance.dto.DocumentMetadata;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "sop_versions")
@CompoundIndexes({
        @CompoundIndex(name = "sop_version_idx", def = "{'sopId': 1, 'versionNumber': -1}", unique = true)
})
public class SOPVersion {

    public enum WorkflowStatus {
        DRAFT,
        IN_REVIEW,
        APPROVED,
        ACTIVE
    }

    @Id
    private String id;

    @Indexed
    @Field("sop_id")
    private String sopId;

    @Field("version_number")
    private int versionNumber;

    @Field("document_metadata")
    private DocumentMetadata documentMetadata;

    @Field("storage_reference")
    private String storageReference;

    @Field("created_by")
    private String createdBy;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    @Field("change_summary")
    private String changeSummary;

    @Field("workflow_status")
    private WorkflowStatus workflowStatus = WorkflowStatus.ACTIVE;

    public SOPVersion() {
    }

    public SOPVersion(String sopId, int versionNumber, DocumentMetadata documentMetadata, String storageReference, String createdBy, String changeSummary) {
        this.sopId = sopId;
        this.versionNumber = versionNumber;
        this.documentMetadata = documentMetadata;
        this.storageReference = storageReference;
        this.createdBy = createdBy;
        this.changeSummary = changeSummary;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSopId() {
        return sopId;
    }

    public void setSopId(String sopId) {
        this.sopId = sopId;
    }

    public int getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(int versionNumber) {
        this.versionNumber = versionNumber;
    }

    public DocumentMetadata getDocumentMetadata() {
        return documentMetadata;
    }

    public void setDocumentMetadata(DocumentMetadata documentMetadata) {
        this.documentMetadata = documentMetadata;
    }

    public String getStorageReference() {
        return storageReference;
    }

    public void setStorageReference(String storageReference) {
        this.storageReference = storageReference;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getChangeSummary() {
        return changeSummary;
    }

    public void setChangeSummary(String changeSummary) {
        this.changeSummary = changeSummary;
    }

    public WorkflowStatus getWorkflowStatus() {
        return workflowStatus;
    }

    public void setWorkflowStatus(WorkflowStatus workflowStatus) {
        this.workflowStatus = workflowStatus;
    }
}
