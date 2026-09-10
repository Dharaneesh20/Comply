package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "process_observations")
@CompoundIndexes({
    @CompoundIndex(name = "org_sop_case_idx", def = "{'organizationId': 1, 'sopId': 1, 'caseId': 1}")
})
public class ProcessObservation {

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String sopId;

    private String caseId;
    private List<ObservedStep> observedSequence;
    private String status; // COMPLETE, IN_PROGRESS, ANOMALOUS
    private Instant createdAt;

    public static class ObservedStep {
        private String eventType;
        private Instant timestamp;
        private String source;

        public ObservedStep() {}

        public ObservedStep(String eventType, Instant timestamp, String source) {
            this.eventType = eventType;
            this.timestamp = timestamp;
            this.source = source;
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
    }

    public ProcessObservation() {
        this.createdAt = Instant.now();
        this.status = "COMPLETE";
    }

    public ProcessObservation(String organizationId, String sopId, String caseId, List<ObservedStep> observedSequence) {
        this.organizationId = organizationId;
        this.sopId = sopId;
        this.caseId = caseId;
        this.observedSequence = observedSequence;
        this.status = "COMPLETE";
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

    public String getCaseId() {
        return caseId;
    }

    public void setCaseId(String caseId) {
        this.caseId = caseId;
    }

    public List<ObservedStep> getObservedSequence() {
        return observedSequence;
    }

    public void setObservedSequence(List<ObservedStep> observedSequence) {
        this.observedSequence = observedSequence;
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
}
