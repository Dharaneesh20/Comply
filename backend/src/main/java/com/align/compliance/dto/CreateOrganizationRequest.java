package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Create Organization Request Payload")
public class CreateOrganizationRequest {

    @NotBlank(message = "Organization name is required")
    @Schema(description = "Organization Display Name", example = "Acme Corp")
    private String name;

    @NotBlank(message = "Organization slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    @Schema(description = "Unique Organization URL slug", example = "acme-corp")
    private String slug;

    @Schema(description = "Associated email domain", example = "acme.com")
    private String domain;

    public CreateOrganizationRequest() {
    }

    public CreateOrganizationRequest(String name, String slug, String domain) {
        this.name = name;
        this.slug = slug;
        this.domain = domain;
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
}
