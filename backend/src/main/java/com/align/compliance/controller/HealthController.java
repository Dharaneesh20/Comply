package com.align.compliance.controller;

import com.align.compliance.dto.HealthResponse;
import com.align.compliance.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "System health check API")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    @Operation(summary = "Get system health status", description = "Returns application status and MongoDB database connectivity status.")
    public ResponseEntity<HealthResponse> getHealth() {
        log.debug("Health check requested");
        HealthResponse health = healthService.getSystemHealth();
        return ResponseEntity.ok(health);
    }
}
