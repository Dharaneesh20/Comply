package com.align.compliance.repository;

import com.align.compliance.model.Regulation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegulationRepository extends MongoRepository<Regulation, String> {

    List<Regulation> findByOrganizationId(String organizationId);

    Page<Regulation> findByOrganizationId(String organizationId, Pageable pageable);

    long countByOrganizationId(String organizationId);

    long countByOrganizationIdAndStatus(String organizationId, Regulation.Status status);
}
