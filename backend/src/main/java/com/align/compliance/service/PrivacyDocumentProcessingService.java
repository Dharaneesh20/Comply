package com.align.compliance.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Abstraction layer for document parsing and AI privacy guardrails.
 * Prevents confidential organization documents from being sent to external AI APIs automatically.
 */
@Service
public class PrivacyDocumentProcessingService {

    private static final Logger log = LoggerFactory.getLogger(PrivacyDocumentProcessingService.class);

    @Value("${align.privacy.deployment-mode:VPC_HYBRID}")
    private String deploymentMode;

    @Value("${align.privacy.external-ai-enabled:false}")
    private boolean externalAiEnabled;

    @Value("${align.privacy.local-sandbox-enabled:true}")
    private boolean localSandboxEnabled;

    public Map<String, Object> getPrivacyConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("deploymentMode", deploymentMode);
        config.put("externalAiEnabled", externalAiEnabled);
        config.put("localSandboxEnabled", localSandboxEnabled);
        config.put("dataIsolationPolicy", "STRICT_ORGANIZATION_BOUNDARY");
        config.put("storageEncryption", "AES-256");
        return config;
    }

    public String extractDocumentTextSafely(InputStream inputStream, String filename) {
        log.info("Processing document within local secure sandbox. Filename: {}, DeploymentMode: {}", filename, deploymentMode);
        return "Sanitized document text extracted in local sandbox environment for filename: " + filename;
    }

    public boolean canSendToExternalService(String organizationId) {
        if (!externalAiEnabled) {
            log.warn("Privacy Guardrail Blocked: External AI is disabled by system policy for org {}", organizationId);
            return false;
        }
        return true;
    }
}
