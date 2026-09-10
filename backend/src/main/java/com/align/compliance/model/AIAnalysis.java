package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "ai_analyses")
@CompoundIndex(name = "org_doc_idx", def = "{'organization_id': 1, 'document_id': 1, 'created_at': -1}")
public class AIAnalysis {

    @Id
    private String id;

    @Field("organization_id")
    private String organizationId;

    @Field("document_id")
    private String documentId;

    @Field("document_version")
    private Integer documentVersion = 1;

    @Field("analysis_type")
    private String analysisType; // MATCH_SOP, GAP_ANALYSIS, CONFLICT_DETECTION

    @Field("model_name")
    private String modelName;

    @Field("model_version")
    private String modelVersion;

    @Field("pipeline_version")
    private String pipelineVersion;

    private List<Map<String, Object>> results = new ArrayList<>();

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public AIAnalysis() {
    }

    public AIAnalysis(String organizationId, String documentId, Integer documentVersion,
                      String analysisType, String modelName, String modelVersion,
                      String pipelineVersion, List<Map<String, Object>> results) {
        this.organizationId = organizationId;
        this.documentId = documentId;
        this.documentVersion = documentVersion;
        this.analysisType = analysisType;
        this.modelName = modelName;
        this.modelVersion = modelVersion;
        this.pipelineVersion = pipelineVersion;
        if (results != null) {
            this.results = results;
        }
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

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    public Integer getDocumentVersion() {
        return documentVersion;
    }

    public void setDocumentVersion(Integer documentVersion) {
        this.documentVersion = documentVersion;
    }

    public String getAnalysisType() {
        return analysisType;
    }

    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public String getPipelineVersion() {
        return pipelineVersion;
    }

    public void setPipelineVersion(String pipelineVersion) {
        this.pipelineVersion = pipelineVersion;
    }

    public List<Map<String, Object>> getResults() {
        return results;
    }

    public void setResults(List<Map<String, Object>> results) {
        this.results = results;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
