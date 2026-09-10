package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "compliance_mappings")
@CompoundIndexes({
    @CompoundIndex(name = "unique_active_mapping_idx", def = "{'organizationId': 1, 'requirementId': 1, 'sopId': 1, 'status': 1}", unique = true),
    @CompoundIndex(name = "org_reg_mapping_idx", def = "{'organizationId': 1, 'regulationId': 1}"),
    @CompoundIndex(name = "org_sop_mapping_idx", def = "{'organizationId': 1, 'sopId': 1}")
})
public class ComplianceMapping {

    public enum MappingType {
        FULL,
        PARTIAL,
        NOT_IMPLEMENTED,
        NOT_APPLICABLE
    }

    public enum MappingStatus {
        ACTIVE,
        ARCHIVED
    }

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String regulationId;

    private String regulationVersionId;

    @Indexed
    private String requirementId;

    @Indexed
    private String sopId;

    private String sopVersionId;

    private MappingType mappingType = MappingType.FULL;

    private double confidence = 1.0; // 1.0 for 100% manual mapping

    private MappingStatus status = MappingStatus.ACTIVE;

    private String notes;

    private String createdBy;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public ComplianceMapping() {}

    public ComplianceMapping(String organizationId, String regulationId, String regulationVersionId, String requirementId, String sopId, String sopVersionId, MappingType mappingType, double confidence, MappingStatus status, String notes, String createdBy) {
        this.organizationId = organizationId;
        this.regulationId = regulationId;
        this.regulationVersionId = regulationVersionId;
        this.requirementId = requirementId;
        this.sopId = sopId;
        this.sopVersionId = sopVersionId;
        this.mappingType = mappingType != null ? mappingType : MappingType.FULL;
        this.confidence = confidence > 0 ? confidence : 1.0;
        this.status = status != null ? status : MappingStatus.ACTIVE;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }

    public String getRegulationId() { return regulationId; }
    public void setRegulationId(String regulationId) { this.regulationId = regulationId; }

    public String getRegulationVersionId() { return regulationVersionId; }
    public void setRegulationVersionId(String regulationVersionId) { this.regulationVersionId = regulationVersionId; }

    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }

    public String getSopId() { return sopId; }
    public void setSopId(String sopId) { this.sopId = sopId; }

    public String getSopVersionId() { return sopVersionId; }
    public void setSopVersionId(String sopVersionId) { this.sopVersionId = sopVersionId; }

    public MappingType getMappingType() { return mappingType; }
    public void setMappingType(MappingType mappingType) { this.mappingType = mappingType; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public MappingStatus getStatus() { return status; }
    public void setStatus(MappingStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
