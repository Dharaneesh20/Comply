package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Update SOP Request Payload")
public class UpdateSOPRequest {

    @Schema(description = "SOP Title")
    private String title;

    @Schema(description = "SOP Description")
    private String description;

    @Schema(description = "Department name")
    private String department;

    @Schema(description = "Owner user ID")
    private String ownerId;

    @Schema(description = "SOP Status (DRAFT, PUBLISHED, UNDER_REVIEW, ARCHIVED)")
    private String status;

    public UpdateSOPRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
