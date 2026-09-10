package com.align.compliance.dto;

public class UpdateImpactStatusRequest {
    private String status; // PENDING_REVIEW, UNDER_REVIEW, SOP_REVISED, NO_ACTION_NEEDED

    public UpdateImpactStatusRequest() {}

    public UpdateImpactStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
