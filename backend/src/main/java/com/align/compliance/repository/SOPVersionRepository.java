package com.align.compliance.repository;

import com.align.compliance.model.SOPVersion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SOPVersionRepository extends MongoRepository<SOPVersion, String> {
    List<SOPVersion> findBySopIdOrderByVersionNumberDesc(String sopId);
    Optional<SOPVersion> findBySopIdAndVersionNumber(String sopId, int versionNumber);
}
