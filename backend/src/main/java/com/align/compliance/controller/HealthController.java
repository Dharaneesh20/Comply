package com.align.compliance.controller;

import com.align.compliance.dto.HealthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "System health check API")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping
    @Operation(summary = "Get system health status", description = "Returns operational health metrics, database connection status, and service uptime timestamp.")
    public ResponseEntity<HealthResponse> getHealth() {
        log.debug("Health check requested");
        String dbStatus = checkDatabaseConnection();

        HealthResponse health = new HealthResponse(
                "UP",
                "Align Compliance Engine",
                Instant.now(),
                dbStatus
        );

        return ResponseEntity.ok(health);
    }

    private String checkDatabaseConnection() {
        if (dataSource == null) {
            return "UNCONFIGURED";
        }
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                return "CONNECTED";
            } else {
                return "UNHEALTHY";
            }
        } catch (Exception e) {
            log.warn("Database health check failed: {}", e.getMessage());
            return "DISCONNECTED";
        }
    }
}
