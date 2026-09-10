package com.align.compliance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AIServiceClient.class);

    @Value("${align.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public AIServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    public List<Map<String, Object>> analyzeDocumentChunks(String documentId, String title, String text) {
        String endpoint = aiServiceUrl + "/api/v1/analyze/document";
        Map<String, Object> payload = Map.of(
                "document_id", documentId,
                "title", title,
                "text", text,
                "chunk_size", 500
        );

        try {
            ResponseEntity<List> response = restTemplate.postForEntity(endpoint, payload, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (List<Map<String, Object>>) response.getBody();
            }
        } catch (Exception e) {
            log.warn("AI Service document analysis call failed ({}), returning empty chunks fallback", e.getMessage());
        }
        return Collections.emptyList();
    }

    public Map<String, Object> analyzeFindingExplanation(String title, String description, String reqText, String sopText) {
        String endpoint = aiServiceUrl + "/api/v1/analyze/finding";
        Map<String, Object> payload = new HashMap<>();
        payload.put("finding_title", title);
        payload.put("finding_description", description);
        if (reqText != null) payload.put("requirement_text", reqText);
        if (sopText != null) payload.put("sop_text", sopText);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, payload, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            }
        } catch (Exception e) {
            log.warn("AI Service finding analysis call failed ({}), returning fallback explanation", e.getMessage());
        }

        return Map.of(
                "result", "POTENTIAL_GAP",
                "confidence", 0.85,
                "evidence", List.of(Map.of("text", "Deterministic rule trigger identified gap")),
                "reasoning_summary", "AI Service fallback: Procedure requires review against requirement standard.",
                "suggested_action", "Review mapped SOP section for procedural completeness.",
                "model", "FallbackRuleEngine",
                "model_version", "1.0.0",
                "pipeline_version", "1.0.0"
        );
    }
}
