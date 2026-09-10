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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RegulationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository memberRepository;

    @Autowired
    private RegulationRepository regulationRepository;

    @Autowired
    private RegulationVersionRepository versionRepository;

    @Autowired
    private RegulatoryRequirementRepository requirementRepository;

    private String userToken;
    private String organizationId;

    @BeforeEach
    void setUp() throws Exception {
        regulationRepository.deleteAll();
        versionRepository.deleteAll();
        requirementRepository.deleteAll();
        memberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest register = new RegisterRequest("Regulatory Auditor", "reg_" + suffix + "@test.com", "password123");
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class);
        userToken = auth.getToken();

        CreateOrganizationRequest createOrg = new CreateOrganizationRequest("Regulatory Org", "reg-org-" + suffix, "reg.com");
        MvcResult orgRes = mockMvc.perform(post("/api/v1/organizations")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOrg)))
                .andExpect(status().isCreated())
                .andReturn();

        OrganizationResponse org = objectMapper.readValue(orgRes.getResponse().getContentAsString(), OrganizationResponse.class);
        organizationId = org.getId();
    }

    @Test
    void testCompleteRegulatoryLifecycle() throws Exception {
        // 1. Create Regulation
        CreateRegulationRequest createRequest = new CreateRegulationRequest();
        createRequest.setTitle("EU General Data Protection Regulation");
        createRequest.setJurisdiction("European Union");
        createRequest.setAuthority("EU Parliament");
        createRequest.setCategory("Data Privacy");
        createRequest.setStatus(Regulation.Status.ACTIVE);
        createRequest.setInitialDocumentReference("CELEX_32016R0679");

        String responseStr = mockMvc.perform(post("/api/v1/regulations")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("EU General Data Protection Regulation")))
                .andExpect(jsonPath("$.jurisdiction", is("European Union")))
                .andReturn().getResponse().getContentAsString();

        Regulation createdReg = objectMapper.readValue(responseStr, Regulation.class);

        // 2. Get Regulation by ID
        mockMvc.perform(get("/api/v1/regulations/" + createdReg.getId())
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("EU General Data Protection Regulation")));

        // 3. Create Version 2
        CreateRegulationVersionRequest versionRequest = new CreateRegulationVersionRequest();
        versionRequest.setDocumentReference("CELEX_32016R0679_V2");
        versionRequest.setEffectiveDate(Instant.now());

        mockMvc.perform(post("/api/v1/regulations/" + createdReg.getId() + "/versions")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(versionRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.versionNumber", is(2)))
                .andExpect(jsonPath("$.documentReference", is("CELEX_32016R0679_V2")));

        // 4. Add Requirement Clause
        CreateRequirementRequest reqRequest = new CreateRequirementRequest();
        reqRequest.setRequirementText("Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.");
        reqRequest.setSectionReference("Article 32(1)");
        reqRequest.setApplicability("Data Controllers and Processors");
        reqRequest.setSourceReference("EU GDPR Art. 32");

        mockMvc.perform(post("/api/v1/regulations/" + createdReg.getId() + "/requirements")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sectionReference", is("Article 32(1)")))
                .andExpect(jsonPath("$.requirementText", containsString("technical and organizational measures")));

        // 5. Retrieve Requirements
        mockMvc.perform(get("/api/v1/regulations/" + createdReg.getId() + "/requirements")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sectionReference", is("Article 32(1)")));

        // 6. Get Metrics
        mockMvc.perform(get("/api/v1/regulations/metrics")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRegulations", is(1)))
                .andExpect(jsonPath("$.activeRegulations", is(1)))
                .andExpect(jsonPath("$.totalRequirements", is(1)));
    }
}
