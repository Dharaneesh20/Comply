package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "regulatory_sources")
public class RegulatorySource {

    @Id
    private String id;

    private String name; // e.g. "EUR-Lex Official Journal", "Federal Register"

    private String url;

    private String type; // e.g. "OFFICIAL_GAZETTE", "REGULATORY_BODY", "STANDARDS_ORG"

    private Instant createdAt = Instant.now();

    public RegulatorySource() {}

    public RegulatorySource(String name, String url, String type) {
        this.name = name;
        this.url = url;
        this.type = type;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
