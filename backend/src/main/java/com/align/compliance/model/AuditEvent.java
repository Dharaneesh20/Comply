package com.align.compliance.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "audit_events")
@CompoundIndex(name = "org_time_idx", def = "{'organization_id': 1, 'timestamp': -1}")
@CompoundIndex(name = "org_action_idx", def = "{'organization_id': 1, 'action': 1}")
public class AuditEvent {

    @Id
    private String id;

    @Field("organization_id")
    private String organizationId;

    @Field("actor_id")
    private String actorId;

    @Field("actor_email")
    private String actorEmail;

    private String action;

    @Field("resource_type")
    private String resourceType;

    @Field("resource_id")
    private String resourceId;

    private Instant timestamp = Instant.now();

    @Field("ip_address")
    private String ipAddress;

    private Map<String, Object> metadata = new HashMap<>();

    public AuditEvent() {
    }

    public AuditEvent(String organizationId, String actorId, String actorEmail, String action,
                      String resourceType, String resourceId, String ipAddress, Map<String, Object> metadata) {
        this.organizationId = organizationId;
        this.actorId = actorId;
        this.actorEmail = actorEmail;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.ipAddress = ipAddress;
        if (metadata != null) {
            this.metadata = metadata;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}
