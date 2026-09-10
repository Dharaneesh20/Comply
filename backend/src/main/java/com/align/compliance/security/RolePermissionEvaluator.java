package com.align.compliance.security;

import com.align.compliance.model.OrganizationMember;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class RolePermissionEvaluator {

    private final OrganizationMemberRepository memberRepository;

    private static final Map<String, Integer> ROLE_HIERARCHY = Map.of(
            "OWNER", 5,
            "ADMIN", 4,
            "COMPLIANCE_MANAGER", 3,
            "REVIEWER", 2,
            "MEMBER", 1
    );

    public RolePermissionEvaluator(OrganizationMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public boolean hasRoleOrHigher(String userId, String organizationId, String requiredRole) {
        return memberRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .map(OrganizationMember::getMemberRole)
                .map(userRole -> {
                    int userLevel = ROLE_HIERARCHY.getOrDefault(userRole.toUpperCase(), 0);
                    int requiredLevel = ROLE_HIERARCHY.getOrDefault(requiredRole.toUpperCase(), 99);
                    return userLevel >= requiredLevel;
                })
                .orElse(false);
    }

    public String getUserRoleInOrg(String userId, String organizationId) {
        return memberRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .map(OrganizationMember::getMemberRole)
                .orElse("MEMBER");
    }
}
