package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "SOP Metrics Counter Response")
public class SOPMetricsResponse {

    @Schema(description = "Total SOPs count for organization", example = "12")
    private long totalSops;

    @Schema(description = "Published SOPs count", example = "8")
    private long publishedSops;

    @Schema(description = "Draft SOPs count", example = "3")
    private long draftSops;

    @Schema(description = "Archived SOPs count", example = "1")
    private long archivedSops;

    public SOPMetricsResponse() {
    }

    public SOPMetricsResponse(long totalSops, long publishedSops, long draftSops, long archivedSops) {
        this.totalSops = totalSops;
        this.publishedSops = publishedSops;
        this.draftSops = draftSops;
        this.archivedSops = archivedSops;
    }

    public long getTotalSops() {
        return totalSops;
    }

    public void setTotalSops(long totalSops) {
        this.totalSops = totalSops;
    }

    public long getPublishedSops() {
        return publishedSops;
    }

    public void setPublishedSops(long publishedSops) {
        this.publishedSops = publishedSops;
    }

    public long getDraftSops() {
        return draftSops;
    }

    public void setDraftSops(long draftSops) {
        this.draftSops = draftSops;
    }

    public long getArchivedSops() {
        return archivedSops;
    }

    public void setArchivedSops(long archivedSops) {
        this.archivedSops = archivedSops;
    }
}
