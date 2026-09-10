package com.align.compliance.repository;

import com.align.compliance.model.RegulationVersion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegulationVersionRepository extends MongoRepository<RegulationVersion, String> {

    List<RegulationVersion> findByRegulationIdOrderByVersionNumberDesc(String regulationId);

    Optional<RegulationVersion> findTopByRegulationIdOrderByVersionNumberDesc(String regulationId);
}
