package com.align.compliance.dto;

import java.time.Instant;

public class HealthResponse {
    private String status;
    private String service;
    private Instant timestamp;
    private String database;

    public HealthResponse() {
    }

    public HealthResponse(String status, String service, Instant timestamp, String database) {
        this.status = status;
        this.service = service;
        this.timestamp = timestamp;
        this.database = database;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }
}
