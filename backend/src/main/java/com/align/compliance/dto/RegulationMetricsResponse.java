package com.align.compliance.dto;

public class RegulationMetricsResponse {

    private long totalRegulations;
    private long activeRegulations;
    private long draftRegulations;
    private long supersededRegulations;
    private long totalRequirements;

    public RegulationMetricsResponse() {}

    public RegulationMetricsResponse(long totalRegulations, long activeRegulations, long draftRegulations, long supersededRegulations, long totalRequirements) {
        this.totalRegulations = totalRegulations;
        this.activeRegulations = activeRegulations;
        this.draftRegulations = draftRegulations;
        this.supersededRegulations = supersededRegulations;
        this.totalRequirements = totalRequirements;
    }

    public long getTotalRegulations() { return totalRegulations; }
    public void setTotalRegulations(long totalRegulations) { this.totalRegulations = totalRegulations; }

    public long getActiveRegulations() { return activeRegulations; }
    public void setActiveRegulations(long activeRegulations) { this.activeRegulations = activeRegulations; }

    public long getDraftRegulations() { return draftRegulations; }
    public void setDraftRegulations(long draftRegulations) { this.draftRegulations = draftRegulations; }

    public long getSupersededRegulations() { return supersededRegulations; }
    public void setSupersededRegulations(long supersededRegulations) { this.supersededRegulations = supersededRegulations; }

    public long getTotalRequirements() { return totalRequirements; }
    public void setTotalRequirements(long totalRequirements) { this.totalRequirements = totalRequirements; }
}
