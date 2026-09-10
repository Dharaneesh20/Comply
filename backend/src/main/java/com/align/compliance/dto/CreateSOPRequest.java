package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Create SOP Request Payload")
public class CreateSOPRequest {

    @NotBlank(message = "Organization ID is required")
    @Schema(description = "Target Organization ID", example = "60d5ec49f1b2c80015f8d001")
    private String organizationId;

    @NotBlank(message = "Title is required")
    @Schema(description = "SOP Title", example = "Data Privacy & Handling Procedure")
    private String title;

    @Schema(description = "SOP Description", example = "Guidelines for processing customer PII under GDPR")
    private String description;

    @NotBlank(message = "Department is required")
    @Schema(description = "Department name", example = "Engineering")
    private String department;

    @Schema(description = "Initial change summary", example = "Initial draft creation")
    private String changeSummary;

    public CreateSOPRequest() {
    }

    public CreateSOPRequest(String organizationId, String title, String description, String department, String changeSummary) {
        this.organizationId = organizationId;
        this.title = title;
        this.description = description;
        this.department = department;
        this.changeSummary = changeSummary;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
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

    public String getChangeSummary() {
        return changeSummary;
    }

    public void setChangeSummary(String changeSummary) {
        this.changeSummary = changeSummary;
    }
}
