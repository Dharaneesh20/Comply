package com.align.compliance.dto;

import com.align.compliance.model.RemediationTask;
import java.time.Instant;

public class UpdateRemediationRequest {
    private String title;
    private String description;
    private String assignedTo;
    private RemediationTask.Priority priority;
    private RemediationTask.Status status;
    private Instant dueDate;

    public UpdateRemediationRequest() {}

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

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public RemediationTask.Priority getPriority() {
        return priority;
    }

    public void setPriority(RemediationTask.Priority priority) {
        this.priority = priority;
    }

    public RemediationTask.Status getStatus() {
        return status;
    }

    public void setStatus(RemediationTask.Status status) {
        this.status = status;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }
}
