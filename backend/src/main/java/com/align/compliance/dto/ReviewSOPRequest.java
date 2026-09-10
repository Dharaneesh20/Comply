package com.align.compliance.dto;

public class ReviewSOPRequest {
    private String sopVersionId;
    private String comments;
    private String status; // PENDING, APPROVED, CHANGES_REQUESTED

    public ReviewSOPRequest() {}

    public String getSopVersionId() {
        return sopVersionId;
    }

    public void setSopVersionId(String sopVersionId) {
        this.sopVersionId = sopVersionId;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
