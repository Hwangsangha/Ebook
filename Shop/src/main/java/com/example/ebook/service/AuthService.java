package com.example.ebook.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.ebook.common.JwtProvider;
import com.example.ebook.domain.UserRepository;
import com.example.ebook.dto.AuthDto;
import lombok.RequiredArgsConstructor;
import com.example.ebook.entity.User;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    //로그인 처리
    public AuthDto.LoginResponse login(AuthDto.LoginRequest req) {

        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        // 비밀번호 검증
        if(!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }

        // JWT발급
        String token = jwtProvider.createAccessToken(user.getId(), user.getRole().name());

        return new AuthDto.LoginResponse(token);
    }
    
}
