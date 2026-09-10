package com.align.compliance.dto;

public class FindingMetricsResponse {

    private long totalOpen;
    private long criticalCount;
    private long highCount;
    private long mediumCount;
    private long lowCount;
    private long totalResolved;

    public FindingMetricsResponse() {}

    public FindingMetricsResponse(long totalOpen, long criticalCount, long highCount, long mediumCount, long lowCount, long totalResolved) {
        this.totalOpen = totalOpen;
        this.criticalCount = criticalCount;
        this.highCount = highCount;
        this.mediumCount = mediumCount;
        this.lowCount = lowCount;
        this.totalResolved = totalResolved;
    }

    public long getTotalOpen() { return totalOpen; }
    public void setTotalOpen(long totalOpen) { this.totalOpen = totalOpen; }

    public long getCriticalCount() { return criticalCount; }
    public void setCriticalCount(long criticalCount) { this.criticalCount = criticalCount; }

    public long getHighCount() { return highCount; }
    public void setHighCount(long highCount) { this.highCount = highCount; }

    public long getMediumCount() { return mediumCount; }
    public void setMediumCount(long mediumCount) { this.mediumCount = mediumCount; }

    public long getLowCount() { return lowCount; }
    public void setLowCount(long lowCount) { this.lowCount = lowCount; }

    public long getTotalResolved() { return totalResolved; }
    public void setTotalResolved(long totalResolved) { this.totalResolved = totalResolved; }
}
