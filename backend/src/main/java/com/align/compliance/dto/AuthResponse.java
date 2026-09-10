package com.align.compliance.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication Response Payload")
public class AuthResponse {

    @Schema(description = "JWT Access Token")
    private String token;

    @Schema(description = "Token Type", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Authenticated User Profile")
    private UserResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
