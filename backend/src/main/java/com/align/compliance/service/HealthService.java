package com.align.compliance.service;

import com.align.compliance.dto.HealthResponse;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    private static final Logger log = LoggerFactory.getLogger(HealthService.class);

    private final MongoTemplate mongoTemplate;

    public HealthService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public HealthResponse getSystemHealth() {
        String dbStatus = checkMongoConnection();
        return new HealthResponse("UP", dbStatus);
    }

    public String checkMongoConnection() {
        try {
            Document pingCommand = new Document("ping", 1);
            Document result = mongoTemplate.getDb().runCommand(pingCommand);
            Number ok = result.get("ok", Number.class);
            if (ok != null && ok.doubleValue() == 1.0) {
                return "UP";
            }
            return "DOWN";
        } catch (Exception e) {
            log.warn("MongoDB connection check failed: {}", e.getMessage());
            return "DOWN";
        }
    }
}
