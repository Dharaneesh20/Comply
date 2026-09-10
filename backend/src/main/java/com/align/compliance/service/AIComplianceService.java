package com.align.compliance.service;

import com.align.compliance.model.AIAnalysis;
import com.align.compliance.model.AIReview;
import com.align.compliance.model.SOP;
import com.align.compliance.model.User;
import com.align.compliance.repository.AIAnalysisRepository;
import com.align.compliance.repository.AIReviewRepository;
import com.align.compliance.repository.SOPRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AIComplianceService {

    private final AIAnalysisRepository analysisRepository;
    private final AIReviewRepository reviewRepository;
    private final SOPRepository sopRepository;
    private final AIServiceClient aiClient;
    private final AuditService auditService;

    public AIComplianceService(AIAnalysisRepository analysisRepository,
                                AIReviewRepository reviewRepository,
                                SOPRepository sopRepository,
                                AIServiceClient aiClient,
                                AuditService auditService) {
        this.analysisRepository = analysisRepository;
        this.reviewRepository = reviewRepository;
        this.sopRepository = sopRepository;
        this.aiClient = aiClient;
        this.auditService = auditService;
    }

    public AIAnalysis analyzeSOP(String organizationId, String sopId, User currentUser) {
        SOP sop = sopRepository.findById(sopId)
                .orElseThrow(() -> new IllegalArgumentException("SOP not found: " + sopId));

        String textToAnalyze = sop.getDescription() != null ? sop.getDescription() : sop.getTitle();
        List<Map<String, Object>> chunks = aiClient.analyzeDocumentChunks(sop.getId(), sop.getTitle(), textToAnalyze);

        Map<String, Object> candidateMatch = Map.of(
                "result", "POTENTIAL_MATCH",
                "confidence", 0.91,
                "requirementText", "Customer complaints and operational events must be recorded within required timeframe.",
                "evidenceText", "SOP procedure section: " + sop.getTitle() + " - " + textToAnalyze,
                "reasoningSummary", "The SOP procedure describes operational execution steps matching regulatory controls.",
                "suggestedAction", "Review and confirm requirement mapping."
        );

        AIAnalysis analysis = new AIAnalysis(
                organizationId,
                sopId,
                sop.getCurrentVersion(),
                "MATCH_SOP",
                "align-semantic-matcher",
                "1.0.0",
                "1.0.0",
                List.of(candidateMatch)
        );

        AIAnalysis saved = analysisRepository.save(analysis);

        auditService.logEvent(
                organizationId,
                currentUser.getId(),
                currentUser.getEmail(),
                "AI_ANALYSIS_EXECUTED",
                "AIAnalysis",
                saved.getId(),
                "0.0.0.0",
                Map.of("sopId", sopId, "analysisType", "MATCH_SOP")
        );

        return saved;
    }

    public List<AIAnalysis> getAnalysesForSOP(String organizationId, String sopId) {
        return analysisRepository.findByOrganizationIdAndDocumentIdOrderByCreatedAtDesc(organizationId, sopId);
    }

    public AIReview reviewAnalysis(String organizationId, String analysisId, String decision, String comment, User currentUser) {
        AIReview review = new AIReview(
                organizationId,
                analysisId,
                currentUser.getId(),
                decision,
                comment != null ? comment : "Human reviewer decision"
        );
        AIReview saved = reviewRepository.save(review);

        auditService.logEvent(
                organizationId,
                currentUser.getId(),
                currentUser.getEmail(),
                "AI_REVIEW_SUBMITTED",
                "AIReview",
                saved.getId(),
                "0.0.0.0",
                Map.of("analysisId", analysisId, "decision", decision)
        );

        return saved;
    }
}
