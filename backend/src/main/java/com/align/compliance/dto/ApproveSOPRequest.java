package com.align.compliance.dto;

public class ApproveSOPRequest {
    private String sopVersionId;
    private String approvalNotes;
    private String status; // APPROVED, REJECTED

    public ApproveSOPRequest() {}

    public String getSopVersionId() {
        return sopVersionId;
    }

    public void setSopVersionId(String sopVersionId) {
        this.sopVersionId = sopVersionId;
    }

    public String getApprovalNotes() {
        return approvalNotes;
    }

    public void setApprovalNotes(String approvalNotes) {
        this.approvalNotes = approvalNotes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
