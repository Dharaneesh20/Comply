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
public class RemediationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RemediationTaskRepository taskRepository;

    @Autowired
    private SOPReviewRepository reviewRepository;

    @Autowired
    private SOPApprovalRepository approvalRepository;

    @Autowired
    private ComplianceFindingRepository findingRepository;

    @Autowired
    private SOPRepository sopRepository;

    private String userToken;
    private String organizationId;
    private String findingId;
    private String sopId;

    @BeforeEach
    void setUp() throws Exception {
        approvalRepository.deleteAll();
        reviewRepository.deleteAll();
        taskRepository.deleteAll();
        findingRepository.deleteAll();
        sopRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest register = new RegisterRequest("Remediation Lead", "remed_" + suffix + "@test.com", "password123");
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class);
        userToken = auth.getToken();

        CreateOrganizationRequest createOrg = new CreateOrganizationRequest("Remediation Org", "remed-org-" + suffix, "remed.com");
        MvcResult orgRes = mockMvc.perform(post("/api/v1/organizations")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOrg)))
                .andExpect(status().isCreated())
                .andReturn();

        OrganizationResponse org = objectMapper.readValue(orgRes.getResponse().getContentAsString(), OrganizationResponse.class);
        organizationId = org.getId();

        SOP sop = new SOP(organizationId, "Access Control SOP", "Procedure for granting user permissions", "Security", auth.getUser().getId());
        sop = sopRepository.save(sop);
        sopId = sop.getId();

        ComplianceFinding finding = new ComplianceFinding(
                organizationId, "req-123", "reg-123", sopId, "1.0",
                ComplianceFinding.FindingType.GAP,
                ComplianceFinding.Severity.HIGH, 75.0,
                "Potential gap in password policy", "Description of gap", "Evidence log",
                "Revise SOP Section 3", ComplianceFinding.Status.OPEN, auth.getUser().getId()
        );
        finding = findingRepository.save(finding);
        findingId = finding.getId();
    }

    @Test
    void testRemediationLifecycleAndSOPApprovalWorkflow() throws Exception {
        CreateRemediationRequest taskReq = new CreateRemediationRequest();
        taskReq.setFindingId(findingId);
        taskReq.setSopId(sopId);
        taskReq.setTitle("Revise Password Complexity Section in Access Control SOP");
        taskReq.setDescription("Update Section 3 to require 16-character passwords.");
        taskReq.setPriority(RemediationTask.Priority.HIGH);

        MvcResult taskRes = mockMvc.perform(post("/api/v1/remediations")
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", organizationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Revise Password Complexity Section in Access Control SOP"))
                .andReturn();

        RemediationTask task = objectMapper.readValue(taskRes.getResponse().getContentAsString(), RemediationTask.class);

        // Submit SOP Review
        ReviewSOPRequest reviewReq = new ReviewSOPRequest();
        reviewReq.setComments("Updated password guidelines look comprehensive.");
        reviewReq.setStatus("APPROVED");

        mockMvc.perform(post("/api/v1/sops/" + sopId + "/review")
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", organizationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // Approve and Activate SOP Version
        ApproveSOPRequest approveReq = new ApproveSOPRequest();
        approveReq.setApprovalNotes("Approved for production activation.");
        approveReq.setStatus("APPROVED");

        mockMvc.perform(post("/api/v1/sops/" + sopId + "/approve")
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", organizationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // Verify Finding is Auto-Resolved
        mockMvc.perform(get("/api/v1/findings/" + findingId)
                        .header("Authorization", "Bearer " + userToken)
                        .header("X-Organization-Id", organizationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }
}
