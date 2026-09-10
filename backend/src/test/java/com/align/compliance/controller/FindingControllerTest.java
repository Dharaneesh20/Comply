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
public class FindingControllerTest {

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
    private RegulatoryRequirementRepository requirementRepository;

    @Autowired
    private SOPRepository sopRepository;

    @Autowired
    private ComplianceMappingRepository mappingRepository;

    @Autowired
    private ComplianceFindingRepository findingRepository;

    private String userToken;
    private String organizationId;
    private Regulation testRegulation;
    private RegulatoryRequirement unmappedRequirement;

    @BeforeEach
    void setUp() throws Exception {
        findingRepository.deleteAll();
        mappingRepository.deleteAll();
        sopRepository.deleteAll();
        requirementRepository.deleteAll();
        regulationRepository.deleteAll();
        memberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest register = new RegisterRequest("Finding Auditor", "finding_" + suffix + "@test.com", "password123");
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class);
        userToken = auth.getToken();

        CreateOrganizationRequest createOrg = new CreateOrganizationRequest("Finding Org", "find-org-" + suffix, "find.com");
        MvcResult orgRes = mockMvc.perform(post("/api/v1/organizations")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOrg)))
                .andExpect(status().isCreated())
                .andReturn();

        OrganizationResponse org = objectMapper.readValue(orgRes.getResponse().getContentAsString(), OrganizationResponse.class);
        organizationId = org.getId();

        // Setup Regulation & Unmapped Requirement
        testRegulation = new Regulation(organizationId, "SOC 2 Type II", "Global", "AICPA", "Security", Regulation.Status.ACTIVE, Instant.now(), Instant.now(), "SOC2-2026", auth.getUser().getId());
        testRegulation = regulationRepository.save(testRegulation);

        unmappedRequirement = new RegulatoryRequirement(testRegulation.getId(), "v1", "Maintain automatic session timeout controls on all management interfaces.", "CC6.1(b)", "All Technology Services", Instant.now(), "AICPA CC6.1", auth.getUser().getId());
        unmappedRequirement = requirementRepository.save(unmappedRequirement);
    }

    @Test
    void testRiskEngineEvaluationAndFindingLifecycle() throws Exception {
        // 1. Trigger Risk Engine Scan Evaluation
        mockMvc.perform(post("/api/v1/findings/evaluate")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].severity", is("HIGH")))
                .andExpect(jsonPath("$[0].findingType", is("GAP")))
                .andExpect(jsonPath("$[0].title", containsString("Potential compliance gap")));

        // 2. Fetch Findings List
        String listResStr = mockMvc.perform(get("/api/v1/findings")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].sectionReference", is("CC6.1(b)")))
                .andReturn().getResponse().getContentAsString();

        String findingId = objectMapper.readTree(listResStr).get("content").get(0).get("id").asText();

        // 3. Update Status to UNDER_REVIEW
        UpdateFindingStatusRequest statusReq = new UpdateFindingStatusRequest();
        statusReq.setStatus(ComplianceFinding.Status.UNDER_REVIEW);
        statusReq.setNotes("Assigned to Information Security Team for remediation.");

        mockMvc.perform(post("/api/v1/findings/" + findingId + "/status")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UNDER_REVIEW")));

        // 4. Update Status to RESOLVED
        statusReq.setStatus(ComplianceFinding.Status.RESOLVED);
        mockMvc.perform(post("/api/v1/findings/" + findingId + "/status")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESOLVED")))
                .andExpect(jsonPath("$.resolvedAt", notNullValue()));

        // 5. Get Metrics
        mockMvc.perform(get("/api/v1/findings/metrics")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalResolved", is(1)))
                .andExpect(jsonPath("$.totalOpen", is(0)));
    }
}
