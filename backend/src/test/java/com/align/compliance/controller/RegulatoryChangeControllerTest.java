package com.align.compliance.controller;

import com.align.compliance.dto.*;
import com.align.compliance.model.*;
import com.align.compliance.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RegulatoryChangeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RegulationRepository regulationRepository;

    @Autowired
    private RegulationVersionRepository versionRepository;

    @Autowired
    private RegulatoryRequirementRepository requirementRepository;

    @Autowired
    private SOPRepository sopRepository;

    @Autowired
    private ComplianceMappingRepository mappingRepository;

    @Autowired
    private RegulatoryChangeRepository changeRepository;

    @Autowired
    private ChangeImpactRepository impactRepository;

    private String userToken;
    private String organizationId;
    private String regulationId;
    private String version1Id;
    private String version2Id;

    @BeforeEach
    void setUp() throws Exception {
        impactRepository.deleteAll();
        changeRepository.deleteAll();
        mappingRepository.deleteAll();
        sopRepository.deleteAll();
        requirementRepository.deleteAll();
        versionRepository.deleteAll();
        regulationRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest register = new RegisterRequest("Change Auditor", "change_" + suffix + "@test.com", "password123");
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class);
        userToken = auth.getToken();

        CreateOrganizationRequest createOrg = new CreateOrganizationRequest("Change Org", "change-org-" + suffix, "change.com");
        MvcResult orgRes = mockMvc.perform(post("/api/v1/organizations")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOrg)))
                .andExpect(status().isCreated())
                .andReturn();

        OrganizationResponse org = objectMapper.readValue(orgRes.getResponse().getContentAsString(), OrganizationResponse.class);
        organizationId = org.getId();

        // Create Regulation, Versions, Requirements & SOP
        Regulation reg = new Regulation(organizationId, "HIPAA Privacy Rule", "HHS", "US Dept of HHS", "Healthcare Privacy", Regulation.Status.ACTIVE, Instant.now(), Instant.now(), "HIPAA-2026", auth.getUser().getId());
        reg = regulationRepository.save(reg);
        regulationId = reg.getId();

        RegulationVersion v1 = new RegulationVersion(regulationId, 1, "doc-ref-1", Instant.now().minusSeconds(86400 * 30), auth.getUser().getId());
        v1 = versionRepository.save(v1);
        version1Id = v1.getId();

        RegulationVersion v2 = new RegulationVersion(regulationId, 2, "doc-ref-2", Instant.now(), auth.getUser().getId());
        v2 = versionRepository.save(v2);
        version2Id = v2.getId();

        RegulatoryRequirement req1 = new RegulatoryRequirement(regulationId, version1Id, "Patient data must be encrypted at rest using AES-256.", "Section 164.312", "All Covered Entities", Instant.now(), "HHS Standard", auth.getUser().getId());
        req1 = requirementRepository.save(req1);

        RegulatoryRequirement req2 = new RegulatoryRequirement(regulationId, version2Id, "Patient data must be encrypted at rest and in transit using AES-256 and TLS 1.3.", "Section 164.312", "All Covered Entities", Instant.now(), "HHS Standard Updated", auth.getUser().getId());
        req2 = requirementRepository.save(req2);

        SOP sop = new SOP(organizationId, "Patient Data Protection SOP", "Standard procedure for patient data encryption", "IT Security", auth.getUser().getId());
        sop = sopRepository.save(sop);

        ComplianceMapping mapping = new ComplianceMapping(organizationId, regulationId, version1Id, req1.getId(), sop.getId(), "1.0", ComplianceMapping.MappingType.FULL, 90.0, ComplianceMapping.MappingStatus.ACTIVE, "Mapped via test", auth.getUser().getId());
        mappingRepository.save(mapping);
    }

    @Test
    void testAnalyzeChangeAndGetImpacts() throws Exception {
        AnalyzeChangeRequest request = new AnalyzeChangeRequest(version1Id, version2Id);

        MvcResult result = mockMvc.perform(post("/api/v1/regulations/" + regulationId + "/analyze-change")
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", organizationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.regulationId").value(regulationId))
                .andExpect(jsonPath("$.oldVersionId").value(version1Id))
                .andExpect(jsonPath("$.newVersionId").value(version2Id))
                .andExpect(jsonPath("$.changedRequirements").isArray())
                .andReturn();

        RegulatoryChange change = objectMapper.readValue(result.getResponse().getContentAsString(), RegulatoryChange.class);

        mockMvc.perform(get("/api/v1/regulatory-changes/" + change.getId())
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(change.getId()));

        mockMvc.perform(get("/api/v1/regulatory-changes/" + change.getId() + "/impacts")
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].impactLevel").exists());
    }
}
