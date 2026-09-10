package com.align.compliance.repository;

import com.align.compliance.model.OrganizationMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends MongoRepository<OrganizationMember, String> {
    @Query("{ 'organization.$id': ?0 }")
    List<OrganizationMember> findByOrganizationId(String organizationId);

    @Query("{ 'user.$id': ObjectId(?0) }")
    List<OrganizationMember> findByUserId(String userId);

    @Query("{ 'organization.$id': ObjectId(?0), 'user.$id': ObjectId(?1) }")
    Optional<OrganizationMember> findByOrganizationIdAndUserId(String organizationId, String userId);
}

