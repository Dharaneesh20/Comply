package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "User Profile Response")
public class UserResponse {

    @Schema(description = "MongoDB ObjectId string", example = "60d5ec49f1b2c80015f8d000")
    private String id;

    @Schema(description = "User email address", example = "john@example.com")
    private String email;

    @Schema(description = "User full name", example = "John Doe")
    private String fullName;

    @Schema(description = "User system role", example = "USER")
    private String role;

    @Schema(description = "Account status", example = "ACTIVE")
    private String status;

    @Schema(description = "Registration timestamp")
    private Instant createdAt;

    public UserResponse() {
    }

    public UserResponse(String id, String email, String fullName, String role, String status, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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
