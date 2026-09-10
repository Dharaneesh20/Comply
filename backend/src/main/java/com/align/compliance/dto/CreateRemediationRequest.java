package com.align.compliance.dto;

import com.align.compliance.model.RemediationTask;
import java.time.Instant;

public class CreateRemediationRequest {
    private String findingId;
    private String sopId;
    private String title;
    private String description;
    private String assignedTo;
    private RemediationTask.Priority priority;
    private Instant dueDate;

    public CreateRemediationRequest() {}

    public String getFindingId() {
        return findingId;
    }

    public void setFindingId(String findingId) {
        this.findingId = findingId;
    }

    public String getSopId() {
        return sopId;
    }

    public void setSopId(String sopId) {
        this.sopId = sopId;
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

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }
}
