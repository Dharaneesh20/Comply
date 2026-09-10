package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "Error Response Details")
public class ErrorResponse {

    @Schema(description = "HTTP Status Code", example = "400")
    private int status;

    @Schema(description = "Error Title", example = "Bad Request")
    private String error;

    @Schema(description = "Detailed Error Message", example = "Email already registered")
    private String message;

    @Schema(description = "Timestamp of error", example = "2026-09-10T10:30:00Z")
    private Instant timestamp = Instant.now();

    public ErrorResponse() {
    }

    public ErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
