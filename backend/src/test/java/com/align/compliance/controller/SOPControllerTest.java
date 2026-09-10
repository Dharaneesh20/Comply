package com.align.compliance.controller;

import com.align.compliance.dto.*;
import com.align.compliance.model.User;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.repository.OrganizationRepository;
import com.align.compliance.repository.SOPRepository;
import com.align.compliance.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SOPControllerTest {

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
    private SOPRepository sopRepository;

    private String userToken;
    private String organizationId;
    private User currentUser;

    @BeforeEach
    void setup() throws Exception {
        sopRepository.deleteAll();
        memberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest register = new RegisterRequest("SOP Tester", "sop_" + suffix + "@test.com", "password123");
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class);
        userToken = auth.getToken();

        CreateOrganizationRequest createOrg = new CreateOrganizationRequest("SOP Org", "sop-org-" + suffix, "sop.com");
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
    void shouldCreateSOPUploadFileCreateVersionHistoryAndArchive() throws Exception {
        // 1. Create SOP with PDF Attachment
        CreateSOPRequest createReq = new CreateSOPRequest(organizationId, "Safety Inspection SOP", "Standard safety guidelines", "Operations", "Initial v1");
        MockMultipartFile jsonPart = new MockMultipartFile("data", "", "application/json", objectMapper.writeValueAsBytes(createReq));
        MockMultipartFile pdfFile = new MockMultipartFile("file", "safety.pdf", "application/pdf", "%PDF-1.4 Mock PDF Content".getBytes());

        MvcResult createRes = mockMvc.perform(multipart("/api/v1/sops")
                        .file(pdfFile)
                        .file(jsonPart)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Safety Inspection SOP"))
                .andExpect(jsonPath("$.currentVersion").value(1))
                .andExpect(jsonPath("$.currentDocumentMetadata.originalFileName").value("safety.pdf"))
                .andReturn();

        SOPResponse sop = objectMapper.readValue(createRes.getResponse().getContentAsString(), SOPResponse.class);
        String sopId = sop.getId();

        // 2. Retrieve SOP Details by ID
        mockMvc.perform(get("/api/v1/sops/" + sopId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sopId));

        // 3. Create Version 2 with new file
        MockMultipartFile pdfFileV2 = new MockMultipartFile("file", "safety_v2.pdf", "application/pdf", "%PDF-1.4 Revised Content".getBytes());
        mockMvc.perform(multipart("/api/v1/sops/" + sopId + "/versions")
                        .file(pdfFileV2)
                        .param("changeSummary", "Updated safety protocols for 2026")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.versionNumber").value(2))
                .andExpect(jsonPath("$.changeSummary").value("Updated safety protocols for 2026"));

        // 4. View Version History (Expect 2 versions)
        mockMvc.perform(get("/api/v1/sops/" + sopId + "/versions")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].versionNumber").value(2))
                .andExpect(jsonPath("$[1].versionNumber").value(1));

        // 5. Archive SOP
        mockMvc.perform(post("/api/v1/sops/" + sopId + "/archive")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));
    }

    @Test
    void shouldRejectInvalidFileType() throws Exception {
        MockMultipartFile exeFile = new MockMultipartFile("file", "malicious.exe", "application/x-msdownload", "binary".getBytes());

        mockMvc.perform(multipart("/api/v1/sops/upload")
                        .file(exeFile)
                        .param("organizationId", organizationId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported file type. Only PDF, DOCX, and TXT files are supported."));
    }
}
