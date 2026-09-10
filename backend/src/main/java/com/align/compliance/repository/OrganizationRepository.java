package com.align.compliance.repository;

import com.align.compliance.model.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends MongoRepository<Organization, String> {
    Optional<Organization> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
