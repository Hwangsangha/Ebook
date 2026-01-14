package com.example.ebook.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.ebook.dto.AuthDto;
import com.example.ebook.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    //로그인 API
    @PostMapping("/login")
    public AuthDto.LoginResponse login(@RequestBody AuthDto.LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/register")   //회원가입 API
    public AuthDto.LoginResponse register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        return authService.register(req);
    }
    
}
