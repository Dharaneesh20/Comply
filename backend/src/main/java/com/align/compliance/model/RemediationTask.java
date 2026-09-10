package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "remediation_tasks")
@CompoundIndexes({
    @CompoundIndex(name = "org_finding_task_idx", def = "{'organizationId': 1, 'findingId': 1}"),
    @CompoundIndex(name = "org_sop_task_idx", def = "{'organizationId': 1, 'sopId': 1}")
})
public class RemediationTask {

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum Status {
        OPEN,
        IN_PROGRESS,
        BLOCKED,
        COMPLETED,
        CANCELLED
    }

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String findingId;

    private String sopId;
    private String title;
    private String description;
    private String assignedTo;
    private Priority priority;
    private Status status;
    private Instant dueDate;
    private Instant createdAt;
    private Instant completedAt;

    public RemediationTask() {
        this.status = Status.OPEN;
        this.priority = Priority.MEDIUM;
        this.createdAt = Instant.now();
    }

    public RemediationTask(String organizationId, String findingId, String sopId, String title, String description, String assignedTo, Priority priority, Instant dueDate) {
        this.organizationId = organizationId;
        this.findingId = findingId;
        this.sopId = sopId;
        this.title = title;
        this.description = description;
        this.assignedTo = assignedTo;
        this.priority = priority != null ? priority : Priority.MEDIUM;
        this.status = Status.OPEN;
        this.dueDate = dueDate;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

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

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
        if (status == Status.COMPLETED && this.completedAt == null) {
            this.completedAt = Instant.now();
        }
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
