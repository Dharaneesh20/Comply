package com.align.compliance.repository;

import com.align.compliance.model.ProcessObservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessObservationRepository extends MongoRepository<ProcessObservation, String> {
    List<ProcessObservation> findByOrganizationIdAndSopId(String organizationId, String sopId);
}
