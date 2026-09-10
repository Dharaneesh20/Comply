package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "Organization Details Response")
public class OrganizationResponse {

    @Schema(description = "MongoDB ObjectId string", example = "60d5ec49f1b2c80015f8d001")
    private String id;

    @Schema(description = "Organization Name", example = "Acme Corp")
    private String name;

    @Schema(description = "Organization Slug", example = "acme-corp")
    private String slug;

    @Schema(description = "Organization Domain", example = "acme.com")
    private String domain;

    @Schema(description = "Organization Logo URL or base64 data", example = "https://example.com/logo.png")
    private String logoUrl;

    @Schema(description = "Organization Status", example = "ACTIVE")
    private String status;

    @Schema(description = "User's role in this organization", example = "ADMIN")
    private String memberRole;

    @Schema(description = "Creation timestamp")
    private Instant createdAt;

    public OrganizationResponse() {
    }

    public OrganizationResponse(String id, String name, String slug, String domain, String logoUrl, String status, String memberRole, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.domain = domain;
        this.logoUrl = logoUrl;
        this.status = status;
        this.memberRole = memberRole;
        this.createdAt = createdAt;
    }

    public OrganizationResponse(String id, String name, String slug, String domain, String status, String memberRole, Instant createdAt) {
        this(id, name, slug, domain, null, status, memberRole, createdAt);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMemberRole() {
        return memberRole;
    }

    public void setMemberRole(String memberRole) {
        this.memberRole = memberRole;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
