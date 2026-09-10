package com.align.compliance.repository;

import com.align.compliance.model.RegulatoryChange;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegulatoryChangeRepository extends MongoRepository<RegulatoryChange, String> {
    List<RegulatoryChange> findByOrganizationId(String organizationId);
    List<RegulatoryChange> findByOrganizationIdAndRegulationId(String organizationId, String regulationId);
}
