package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Application and Database Health Status")
public class HealthResponse {

    @Schema(description = "Application operational status", example = "UP")
    private String application;

    @Schema(description = "MongoDB connectivity status", example = "UP")
    private String database;

    public HealthResponse() {
    }

    public HealthResponse(String application, String database) {
        this.application = application;
        this.database = database;
    }

    public String getApplication() {
        return application;
    }

    public void setApplication(String application) {
        this.application = application;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }
}
