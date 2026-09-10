package com.align.compliance.dto;

import java.time.Instant;
import java.util.Map;

public class SubmitEvidenceRequest {
    private String sopId;
    private String sopVersionId;
    private String caseId;
    private String eventType;
    private Instant timestamp;
    private String source;
    private Map<String, Object> metadata;

    public SubmitEvidenceRequest() {}

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
}
