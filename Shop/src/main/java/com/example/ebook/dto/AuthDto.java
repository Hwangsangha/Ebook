package com.example.ebook.dto;

import lombok.Getter;

public class AuthDto {

    @Getter
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter
    public static class LoginResponse {
        private final String accessToken;

        public LoginResponse(String accessToken) {
            this.accessToken = accessToken;
        }
    }
}
