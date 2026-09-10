package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "organization_members")
@CompoundIndex(name = "org_user_idx", def = "{'organization': 1, 'user': 1}", unique = true)
public class OrganizationMember {

    @Id
    private String id;

    @DBRef
    private Organization organization;

    @DBRef
    private User user;

    @Field("member_role")
    private String memberRole = "MEMBER";

    private String status = "ACTIVE";

    @Field("joined_at")
    private Instant joinedAt = Instant.now();

    public OrganizationMember() {
    }

    public OrganizationMember(Organization organization, User user, String memberRole) {
        this.organization = organization;
        this.user = user;
        this.memberRole = memberRole;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMemberRole() {
        return memberRole;
    }

    public void setMemberRole(String memberRole) {
        this.memberRole = memberRole;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }
}
