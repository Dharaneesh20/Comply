package com.align.compliance.dto;

public class AnalyzeChangeRequest {
    private String oldVersionId;
    private String newVersionId;

    public AnalyzeChangeRequest() {}

    public AnalyzeChangeRequest(String oldVersionId, String newVersionId) {
        this.oldVersionId = oldVersionId;
        this.newVersionId = newVersionId;
    }

    public String getOldVersionId() {
        return oldVersionId;
    }

    public void setOldVersionId(String oldVersionId) {
        this.oldVersionId = oldVersionId;
    }

    public String getNewVersionId() {
        return newVersionId;
    }

    public void setNewVersionId(String newVersionId) {
        this.newVersionId = newVersionId;
    }
}
