package com.align.compliance.controller;

import com.align.compliance.dto.AuthResponse;
import com.align.compliance.dto.CreateOrganizationRequest;
import com.align.compliance.dto.LoginRequest;
import com.align.compliance.dto.OrganizationResponse;
import com.align.compliance.dto.RegisterRequest;
import com.align.compliance.model.User;
import com.align.compliance.repository.OrganizationMemberRepository;
import com.align.compliance.repository.OrganizationRepository;
import com.align.compliance.repository.UserRepository;
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

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthAndOrganizationIntegrationTest {

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

    @BeforeEach
    void cleanDatabase() {
        memberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldCompleteFullPhase1UserFlowAndEnforceOrganizationAccessControl() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String user1Email = "alice_" + randomSuffix + "@example.com";
        String user2Email = "bob_" + randomSuffix + "@example.com";

        // 1. Register User 1 (Alice)
        RegisterRequest register1 = new RegisterRequest("Alice Smith", user1Email, "password123");
        MvcResult regResult1 = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value(user1Email))
                .andReturn();

        AuthResponse authUser1 = objectMapper.readValue(regResult1.getResponse().getContentAsString(), AuthResponse.class);
        String tokenUser1 = authUser1.getToken();
        assertNotNull(tokenUser1);

        // 2. Login User 1
        LoginRequest login1 = new LoginRequest(user1Email, "password123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        // 3. GET /api/v1/auth/me for User 1
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(user1Email));

        // 4. Create Organization for User 1
        CreateOrganizationRequest createOrg = new CreateOrganizationRequest("Acme Compliance", "acme-slug-" + randomSuffix, "acme.com");
        MvcResult createOrgResult = mockMvc.perform(post("/api/v1/organizations")
                        .header("Authorization", "Bearer " + tokenUser1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOrg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Acme Compliance"))
                .andExpect(jsonPath("$.memberRole").value("ADMIN"))
                .andReturn();

        OrganizationResponse orgResponse = objectMapper.readValue(createOrgResult.getResponse().getContentAsString(), OrganizationResponse.class);
        String orgId = orgResponse.getId();
        assertNotNull(orgId);

        // 5. Get Organizations for User 1
        mockMvc.perform(get("/api/v1/organizations")
                        .header("Authorization", "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orgId));

        // 6. Access specific Organization by ID for User 1 (Authorized member)
        mockMvc.perform(get("/api/v1/organizations/" + orgId)
                        .header("Authorization", "Bearer " + tokenUser1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orgId));

        // 7. Register User 2 (Bob)
        RegisterRequest register2 = new RegisterRequest("Bob Jones", user2Email, "password123");
        MvcResult regResult2 = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register2)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse authUser2 = objectMapper.readValue(regResult2.getResponse().getContentAsString(), AuthResponse.class);
        String tokenUser2 = authUser2.getToken();

        // 8. Attempt Unauthorized Organization Access for User 2 (Bob is NOT a member of Alice's Org) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/organizations/" + orgId)
                        .header("Authorization", "Bearer " + tokenUser2))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("Unauthorized access: You are not a member of this organization"));
    }
}
