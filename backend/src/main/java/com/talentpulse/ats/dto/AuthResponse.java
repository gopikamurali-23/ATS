package com.talentpulse.ats.dto;

import com.talentpulse.ats.model.Role;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private Role role;
    private String fullName;
    private String companyName;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String email, Role role, String fullName, String companyName) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.companyName = companyName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
}
