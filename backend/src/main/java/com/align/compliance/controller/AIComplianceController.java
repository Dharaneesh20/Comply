package com.align.compliance.controller;

import com.align.compliance.model.AIAnalysis;
import com.align.compliance.model.AIReview;
import com.align.compliance.model.User;
import com.align.compliance.service.AIComplianceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AIComplianceController {

    private final AIComplianceService aiService;

    public AIComplianceController(AIComplianceService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/sops/{id}/analyze")
    public ResponseEntity<AIAnalysis> analyzeSOP(
            @AuthenticationPrincipal User currentUser,
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String sopId) {

        AIAnalysis analysis = aiService.analyzeSOP(organizationId, sopId, currentUser);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/sops/{id}/ai-analyses")
    public ResponseEntity<List<AIAnalysis>> getSOPAnalyses(
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String sopId) {

        List<AIAnalysis> analyses = aiService.getAnalysesForSOP(organizationId, sopId);
        return ResponseEntity.ok(analyses);
    }

    @PostMapping("/ai-analyses/{id}/review")
    public ResponseEntity<AIReview> reviewAnalysis(
            @AuthenticationPrincipal User currentUser,
            @RequestHeader("X-Organization-Id") String organizationId,
            @PathVariable("id") String analysisId,
            @RequestBody Map<String, String> payload) {

        String decision = payload.getOrDefault("decision", "REVIEW");
        String comment = payload.get("comment");

        AIReview review = aiService.reviewAnalysis(organizationId, analysisId, decision, comment, currentUser);
        return ResponseEntity.ok(review);
    }
}
