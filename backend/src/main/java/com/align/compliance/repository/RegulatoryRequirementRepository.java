package com.align.compliance.repository;

import com.align.compliance.model.RegulatoryRequirement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegulatoryRequirementRepository extends MongoRepository<RegulatoryRequirement, String> {

    List<RegulatoryRequirement> findByRegulationId(String regulationId);

    List<RegulatoryRequirement> findByRegulationIdAndRegulationVersionId(String regulationId, String regulationVersionId);

    long countByRegulationId(String regulationId);

    long countByRegulationIdIn(List<String> regulationIds);
}
