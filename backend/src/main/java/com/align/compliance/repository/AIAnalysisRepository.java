package com.align.compliance.repository;

import com.align.compliance.model.AIAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIAnalysisRepository extends MongoRepository<AIAnalysis, String> {

    List<AIAnalysis> findByOrganizationIdAndDocumentIdOrderByCreatedAtDesc(String organizationId, String documentId);

    List<AIAnalysis> findByOrganizationIdOrderByCreatedAtDesc(String organizationId);
}
