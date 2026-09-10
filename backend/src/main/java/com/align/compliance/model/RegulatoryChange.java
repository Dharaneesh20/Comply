package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "regulatory_changes")
@CompoundIndexes({
    @CompoundIndex(name = "org_reg_change_idx", def = "{'organizationId': 1, 'regulationId': 1}")
})
public class RegulatoryChange {

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String regulationId;

    private String oldVersionId;
    private String newVersionId;
    private int oldVersionNumber;
    private int newVersionNumber;
    private String changeType; // ADDED, MODIFIED, REMOVED, EFFECTIVE_DATE_CHANGED
    private String summary;
    private List<ChangedRequirementItem> changedRequirements;
    private Instant detectedAt;
    private Instant createdAt;

    public static class ChangedRequirementItem {
        private String requirementId;
        private String sectionReference;
        private String changeType; // ADDED, MODIFIED, REMOVED, EFFECTIVE_DATE_CHANGED
        private String oldText;
        private String newText;

        public ChangedRequirementItem() {}

        public ChangedRequirementItem(String requirementId, String sectionReference, String changeType, String oldText, String newText) {
            this.requirementId = requirementId;
            this.sectionReference = sectionReference;
            this.changeType = changeType;
            this.oldText = oldText;
            this.newText = newText;
        }

        public String getRequirementId() {
            return requirementId;
        }

        public void setRequirementId(String requirementId) {
            this.requirementId = requirementId;
        }

        public String getSectionReference() {
            return sectionReference;
        }

        public void setSectionReference(String sectionReference) {
            this.sectionReference = sectionReference;
        }

        public String getChangeType() {
            return changeType;
        }

        public void setChangeType(String changeType) {
            this.changeType = changeType;
        }

        public String getOldText() {
            return oldText;
        }

        public void setOldText(String oldText) {
            this.oldText = oldText;
        }

        public String getNewText() {
            return newText;
        }

        public void setNewText(String newText) {
            this.newText = newText;
        }
    }

    public RegulatoryChange() {
        this.createdAt = Instant.now();
        this.detectedAt = Instant.now();
    }

    public RegulatoryChange(String organizationId, String regulationId, String oldVersionId, String newVersionId, int oldVersionNumber, int newVersionNumber, String changeType, String summary, List<ChangedRequirementItem> changedRequirements) {
        this.organizationId = organizationId;
        this.regulationId = regulationId;
        this.oldVersionId = oldVersionId;
        this.newVersionId = newVersionId;
        this.oldVersionNumber = oldVersionNumber;
        this.newVersionNumber = newVersionNumber;
        this.changeType = changeType;
        this.summary = summary;
        this.changedRequirements = changedRequirements;
        this.detectedAt = Instant.now();
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

    public String getRegulationId() {
        return regulationId;
    }

    public void setRegulationId(String regulationId) {
        this.regulationId = regulationId;
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

    public int getOldVersionNumber() {
        return oldVersionNumber;
    }

    public void setOldVersionNumber(int oldVersionNumber) {
        this.oldVersionNumber = oldVersionNumber;
    }

    public int getNewVersionNumber() {
        return newVersionNumber;
    }

    public void setNewVersionNumber(int newVersionNumber) {
        this.newVersionNumber = newVersionNumber;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<ChangedRequirementItem> getChangedRequirements() {
        return changedRequirements;
    }

    public void setChangedRequirements(List<ChangedRequirementItem> changedRequirements) {
        this.changedRequirements = changedRequirements;
    }

    public Instant getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(Instant detectedAt) {
        this.detectedAt = detectedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
