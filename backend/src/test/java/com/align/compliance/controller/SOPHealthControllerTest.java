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

import java.util.Arrays;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SOPHealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SOPRepository sopRepository;

    @Autowired
    private OperationalEvidenceRepository evidenceRepository;

    @Autowired
    private ProcessObservationRepository observationRepository;

    @Autowired
    private SOPHealthAssessmentRepository healthAssessmentRepository;

    private String userToken;
    private String testOrgId;
    private String testSopId;

    @BeforeEach
    void setUp() throws Exception {
        evidenceRepository.deleteAll();
        observationRepository.deleteAll();
        healthAssessmentRepository.deleteAll();
        sopRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest register = new RegisterRequest("Health Auditor", "health_" + suffix + "@test.com", "password123");
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class);
        userToken = auth.getToken();

        CreateOrganizationRequest createOrg = new CreateOrganizationRequest("Health Org", "health-org-" + suffix, "health.com");
        MvcResult orgRes = mockMvc.perform(post("/api/v1/organizations")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOrg)))
                .andExpect(status().isCreated())
                .andReturn();

        OrganizationResponse org = objectMapper.readValue(orgRes.getResponse().getContentAsString(), OrganizationResponse.class);
        testOrgId = org.getId();

        SOP sop = new SOP(testOrgId, "Customer Complaint Handling SOP", "Standard procedure for handling customer complaints", "Customer Support", auth.getUser().getId());
        sop = sopRepository.save(sop);
        testSopId = sop.getId();
    }

    @Test
    void testRecordObservationAndAnalyzeSOPHealth() throws Exception {
        SubmitObservationRequest request = new SubmitObservationRequest();
        request.setSopId(testSopId);
        request.setCaseId("CASE-999");
        request.setSteps(Arrays.asList(
                new SubmitObservationRequest.ObservedStepDto("Resolve Issue", "WHATSAPP"),
                new SubmitObservationRequest.ObservedStepDto("Create Support Ticket", "JIRA"),
                new SubmitObservationRequest.ObservedStepDto("Close Ticket", "JIRA")
        ));

        mockMvc.perform(post("/api/v1/evidence/observation")
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", testOrgId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sopId").value(testSopId))
                .andExpect(jsonPath("$.caseId").value("CASE-999"));

        mockMvc.perform(post("/api/v1/sop-health/analyze/" + testSopId)
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", testOrgId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sopId").value(testSopId))
                .andExpect(jsonPath("$.deviationsFoundCount").value(1))
                .andExpect(jsonPath("$.deviations[0].deviationType").value("SEQUENCE_OUT_OF_ORDER"));

        mockMvc.perform(get("/api/v1/sop-health/" + testSopId)
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", testOrgId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sopId").value(testSopId))
                .andExpect(jsonPath("$.healthScore").exists());
    }
}
