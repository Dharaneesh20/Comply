package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "sop_health_assessments")
@CompoundIndexes({
    @CompoundIndex(name = "org_sop_assessment_idx", def = "{'organizationId': 1, 'sopId': 1}")
})
public class SOPHealthAssessment {

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String sopId;

    private String sopVersionId;
    private int healthScore; // 0-100
    private int totalCasesAnalyzed;
    private int deviationsFoundCount;
    private List<ProcessDeviation> deviations;
    private List<String> expectedSequence;
    private List<String> observedSequenceSample;
    private Instant lastAnalyzedAt;
    private Instant createdAt;

    public static class ProcessDeviation {
        private String caseId;
        private String deviationType; // SEQUENCE_OUT_OF_ORDER, MISSING_STEP, TIMED_OUT
        private String description;
        private List<String> expectedSteps;
        private List<String> observedSteps;
        private String impactSeverity; // LOW, MEDIUM, HIGH

        public ProcessDeviation() {}

        public ProcessDeviation(String caseId, String deviationType, String description, List<String> expectedSteps, List<String> observedSteps, String impactSeverity) {
            this.caseId = caseId;
            this.deviationType = deviationType;
            this.description = description;
            this.expectedSteps = expectedSteps;
            this.observedSteps = observedSteps;
            this.impactSeverity = impactSeverity;
        }

        public String getCaseId() {
            return caseId;
        }

        public void setCaseId(String caseId) {
            this.caseId = caseId;
        }

        public String getDeviationType() {
            return deviationType;
        }

        public void setDeviationType(String deviationType) {
            this.deviationType = deviationType;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<String> getExpectedSteps() {
            return expectedSteps;
        }

        public void setExpectedSteps(List<String> expectedSteps) {
            this.expectedSteps = expectedSteps;
        }

        public List<String> getObservedSteps() {
            return observedSteps;
        }

        public void setObservedSteps(List<String> observedSteps) {
            this.observedSteps = observedSteps;
        }

        public String getImpactSeverity() {
            return impactSeverity;
        }

        public void setImpactSeverity(String impactSeverity) {
            this.impactSeverity = impactSeverity;
        }
    }

    public SOPHealthAssessment() {
        this.createdAt = Instant.now();
        this.lastAnalyzedAt = Instant.now();
    }

    public SOPHealthAssessment(String organizationId, String sopId, String sopVersionId, int healthScore, int totalCasesAnalyzed, int deviationsFoundCount, List<ProcessDeviation> deviations, List<String> expectedSequence, List<String> observedSequenceSample) {
        this.organizationId = organizationId;
        this.sopId = sopId;
        this.sopVersionId = sopVersionId;
        this.healthScore = healthScore;
        this.totalCasesAnalyzed = totalCasesAnalyzed;
        this.deviationsFoundCount = deviationsFoundCount;
        this.deviations = deviations;
        this.expectedSequence = expectedSequence;
        this.observedSequenceSample = observedSequenceSample;
        this.lastAnalyzedAt = Instant.now();
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

    public String getSopId() {
        return sopId;
    }

    public void setSopId(String sopId) {
        this.sopId = sopId;
    }

    public String getSopVersionId() {
        return sopVersionId;
    }

    public void setSopVersionId(String sopVersionId) {
        this.sopVersionId = sopVersionId;
    }

    public int getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(int healthScore) {
        this.healthScore = healthScore;
    }

    public int getTotalCasesAnalyzed() {
        return totalCasesAnalyzed;
    }

    public void setTotalCasesAnalyzed(int totalCasesAnalyzed) {
        this.totalCasesAnalyzed = totalCasesAnalyzed;
    }

    public int getDeviationsFoundCount() {
        return deviationsFoundCount;
    }

    public void setDeviationsFoundCount(int deviationsFoundCount) {
        this.deviationsFoundCount = deviationsFoundCount;
    }

    public List<ProcessDeviation> getDeviations() {
        return deviations;
    }

    public void setDeviations(List<ProcessDeviation> deviations) {
        this.deviations = deviations;
    }

    public List<String> getExpectedSequence() {
        return expectedSequence;
    }

    public void setExpectedSequence(List<String> expectedSequence) {
        this.expectedSequence = expectedSequence;
    }

    public List<String> getObservedSequenceSample() {
        return observedSequenceSample;
    }

    public void setObservedSequenceSample(List<String> observedSequenceSample) {
        this.observedSequenceSample = observedSequenceSample;
    }

    public Instant getLastAnalyzedAt() {
        return lastAnalyzedAt;
    }

    public void setLastAnalyzedAt(Instant lastAnalyzedAt) {
        this.lastAnalyzedAt = lastAnalyzedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
