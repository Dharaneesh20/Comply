package com.align.compliance.repository;

import com.align.compliance.model.OrganizationMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends MongoRepository<OrganizationMember, String> {
    List<OrganizationMember> findByOrganizationId(String organizationId);
    List<OrganizationMember> findByUserId(String userId);
    Optional<OrganizationMember> findByOrganizationIdAndUserId(String organizationId, String userId);
}
