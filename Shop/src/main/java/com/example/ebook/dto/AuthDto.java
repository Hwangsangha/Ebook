package com.example.ebook.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

public class AuthDto {

    public record LoginRequest(
            @NotBlank(message = "email은 필수입니다.")
            @Email(message = "email 형식이 올바르지 않습니다.")
            String email,
            @NotBlank(message = "password는 필수입니다.")
            String password
    ) {}

    @Getter
    public static class LoginResponse {
        private final String accessToken;

        public LoginResponse(String accessToken) {
            this.accessToken = accessToken;
        }
    }

    //회원가입 요청 DTO
    public record RegisterRequest(
            @NotBlank(message = "email은 필수입니다.")
            @Email(message = "email 형식이 올바르지 않습니다.")
            String email,
            @NotBlank(message = "password는 필수입니다.")
            String password,
            @NotBlank(message = "name은 필수입니다.")
            String name
            ) {}
}
