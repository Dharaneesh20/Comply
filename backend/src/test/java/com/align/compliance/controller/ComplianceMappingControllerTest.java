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
public class ComplianceMappingControllerTest {

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

    private String userToken;
    private String organizationId;
    private Regulation testRegulation;
    private RegulatoryRequirement testRequirement;
    private SOP testSop;

    @BeforeEach
    void setUp() throws Exception {
        mappingRepository.deleteAll();
        sopRepository.deleteAll();
        requirementRepository.deleteAll();
        regulationRepository.deleteAll();
        memberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest register = new RegisterRequest("Mapping Auditor", "mapping_" + suffix + "@test.com", "password123");
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class);
        userToken = auth.getToken();

        CreateOrganizationRequest createOrg = new CreateOrganizationRequest("Mapping Org", "map-org-" + suffix, "map.com");
        MvcResult orgRes = mockMvc.perform(post("/api/v1/organizations")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOrg)))
                .andExpect(status().isCreated())
                .andReturn();

        OrganizationResponse org = objectMapper.readValue(orgRes.getResponse().getContentAsString(), OrganizationResponse.class);
        organizationId = org.getId();

        // Setup Regulation & Requirement
        testRegulation = new Regulation(organizationId, "HIPAA Security Rule", "US Federal", "HHS", "Healthcare", Regulation.Status.ACTIVE, Instant.now(), Instant.now(), "45CFR164", auth.getUser().getId());
        testRegulation = regulationRepository.save(testRegulation);

        testRequirement = new RegulatoryRequirement(testRegulation.getId(), "v1", "Implement access controls for ePHI", "164.312(a)(1)", "Covered Entities", Instant.now(), "45 CFR 164.312", auth.getUser().getId());
        testRequirement = requirementRepository.save(testRequirement);

        // Setup SOP
        testSop = new SOP(organizationId, "Access Control & Password Policy", "Defines ePHI authentication controls", "Security", auth.getUser().getId());
        testSop.setStatus("PUBLISHED");
        testSop = sopRepository.save(testSop);
    }

    @Test
    void testCompleteMappingLifecycle() throws Exception {
        // 1. Create Compliance Mapping
        CreateMappingRequest createReq = new CreateMappingRequest();
        createReq.setRegulationId(testRegulation.getId());
        createReq.setRequirementId(testRequirement.getId());
        createReq.setSopId(testSop.getId());
        createReq.setMappingType(ComplianceMapping.MappingType.FULL);
        createReq.setNotes("SOP Section 3 directly addresses 164.312(a)(1)");

        String createResStr = mockMvc.perform(post("/api/v1/mappings")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.mappingType", is("FULL")))
                .andReturn().getResponse().getContentAsString();

        ComplianceMapping createdMapping = objectMapper.readValue(createResStr, ComplianceMapping.class);

        // 2. Prevent Duplicate Mapping Creation
        mockMvc.perform(post("/api/v1/mappings")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already exists")));

        // 3. Get Mapped SOPs for Regulation
        mockMvc.perform(get("/api/v1/regulations/" + testRegulation.getId() + "/mapped-sops")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sopTitle", is("Access Control & Password Policy")))
                .andExpect(jsonPath("$[0].sectionReference", is("164.312(a)(1)")));

        // 4. Get Mapped Requirements for SOP
        mockMvc.perform(get("/api/v1/sops/" + testSop.getId() + "/requirements")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].regulationTitle", is("HIPAA Security Rule")))
                .andExpect(jsonPath("$[0].sectionReference", is("164.312(a)(1)")));

        // 5. Update Mapping Type to PARTIAL
        UpdateMappingRequest updateReq = new UpdateMappingRequest();
        updateReq.setMappingType(ComplianceMapping.MappingType.PARTIAL);
        updateReq.setNotes("Updated mapping to PARTIAL after ISO audit review.");

        mockMvc.perform(put("/api/v1/mappings/" + createdMapping.getId())
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mappingType", is("PARTIAL")))
                .andExpect(jsonPath("$.notes", containsString("PARTIAL")));

        // 6. Delete Mapping
        mockMvc.perform(delete("/api/v1/mappings/" + createdMapping.getId())
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isNoContent());

        // 7. Verify Mapped SOPs list is now empty
        mockMvc.perform(get("/api/v1/regulations/" + testRegulation.getId() + "/mapped-sops")
                .header("Authorization", "Bearer " + userToken)
                .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
