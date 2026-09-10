package com.align.compliance.dto;

import com.align.compliance.model.ComplianceFinding;
import jakarta.validation.constraints.NotNull;

public class UpdateFindingStatusRequest {

    @NotNull(message = "Status is required")
    private ComplianceFinding.Status status;

    private String notes;

    public ComplianceFinding.Status getStatus() { return status; }
    public void setStatus(ComplianceFinding.Status status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
