package com.align.compliance.service;

import com.align.compliance.dto.CreateOrganizationRequest;
import com.align.compliance.dto.OrganizationResponse;
import com.align.compliance.model.Organization;
import com.align.compliance.model.OrganizationMember;
import com.align.compliance.model.User;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.repository.OrganizationRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;

    public OrganizationService(OrganizationRepository organizationRepository, OrganizationMemberRepository memberRepository) {
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
    }

    public OrganizationResponse createOrganization(CreateOrganizationRequest request, User currentUser) {
        if (organizationRepository.existsBySlug(request.getSlug())) {
            throw new DuplicateKeyException("Organization slug is already in use");
        }

        Organization organization = new Organization(
                request.getName(),
                request.getSlug(),
                request.getDomain()
        );

        Organization savedOrg = organizationRepository.save(organization);

        OrganizationMember member = new OrganizationMember(savedOrg, currentUser, "ADMIN");
        memberRepository.save(member);

        return toOrganizationResponse(savedOrg, "ADMIN");
    }

    public List<OrganizationResponse> getUserOrganizations(User currentUser) {
        List<OrganizationMember> memberships = memberRepository.findByUserId(currentUser.getId());

        return memberships.stream()
                .map(m -> toOrganizationResponse(m.getOrganization(), m.getMemberRole()))
                .collect(Collectors.toList());
    }

    public OrganizationResponse getOrganizationById(String organizationId, User currentUser) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        Optional<OrganizationMember> memberOpt = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUser.getId());
        if (memberOpt.isEmpty()) {
            throw new AccessDeniedException("Unauthorized access: You are not a member of this organization");
        }

        return toOrganizationResponse(organization, memberOpt.get().getMemberRole());
    }

    public OrganizationResponse toOrganizationResponse(Organization org, String memberRole) {
        return new OrganizationResponse(
                org.getId(),
                org.getName(),
                org.getSlug(),
                org.getDomain(),
                org.getStatus(),
                memberRole,
                org.getCreatedAt()
        );
    }
}
