package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "operational_evidence")
@CompoundIndexes({
    @CompoundIndex(name = "org_sop_idx", def = "{'organizationId': 1, 'sopId': 1}"),
    @CompoundIndex(name = "org_timestamp_idx", def = "{'organizationId': 1, 'timestamp': -1}")
})
public class OperationalEvidence {

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String sopId;

    private String sopVersionId;
    private String caseId;
    private String eventType;
    private Instant timestamp;
    private String source;
    private Map<String, Object> metadata;
    private Instant createdAt;

    public OperationalEvidence() {
        this.createdAt = Instant.now();
    }

    public OperationalEvidence(String organizationId, String sopId, String sopVersionId, String caseId, String eventType, Instant timestamp, String source, Map<String, Object> metadata) {
        this.organizationId = organizationId;
        this.sopId = sopId;
        this.sopVersionId = sopVersionId;
        this.caseId = caseId;
        this.eventType = eventType;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
        this.source = source;
        this.metadata = metadata;
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

    public String getCaseId() {
        return caseId;
    }

    public void setCaseId(String caseId) {
        this.caseId = caseId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
