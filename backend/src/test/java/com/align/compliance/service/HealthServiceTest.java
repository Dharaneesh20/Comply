package com.align.compliance.service;

import com.align.compliance.dto.HealthResponse;
import org.bson.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import com.mongodb.client.MongoDatabase;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class HealthServiceTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private MongoDatabase mongoDatabase;

    @InjectMocks
    private HealthService healthService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void shouldReturnUpWhenMongoPingSucceeds() {
        given(mongoTemplate.getDb()).willReturn(mongoDatabase);
        given(mongoDatabase.runCommand(any(Document.class))).willReturn(new Document("ok", 1.0));

        HealthResponse response = healthService.getSystemHealth();

        assertEquals("UP", response.getApplication());
        assertEquals("UP", response.getDatabase());
    }

    @Test
    void shouldReturnDownWhenMongoPingFails() {
        given(mongoTemplate.getDb()).willReturn(mongoDatabase);
        given(mongoDatabase.runCommand(any(Document.class))).willThrow(new RuntimeException("Connection refused"));

        HealthResponse response = healthService.getSystemHealth();

        assertEquals("UP", response.getApplication());
        assertEquals("DOWN", response.getDatabase());
    }
}
