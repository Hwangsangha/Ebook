package com.example.ebook.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.ebook.common.JwtProvider;
import com.example.ebook.controller.AdminEbookController;
import com.example.ebook.controller.AuthController;
import com.example.ebook.domain.UserRepository;
import com.example.ebook.dto.AuthDto;
import lombok.RequiredArgsConstructor;
import com.example.ebook.entity.User;
import com.example.ebook.entity.User.Role;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    //회원가입
    public AuthDto.LoginResponse register(AuthDto.RegisterRequest req) {
        String email = req.email().trim().toLowerCase();

        if(userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 사용 중인 이메일입니다.");
        }

        User u = new User();    //유저 생성
        u.setEmail(email);      //이메일 저장
        u.setName(req.name().trim());   //이름 저장
        u.setPassword(passwordEncoder.encode(req.password()));  //해시 저장
        u.setRole(Role.USER);

        User saved = userRepository.save(u);

        //로그인과 동일한 방식으로 토큰 발급
        return login(new AuthDto.LoginRequest(email, req.password()));

    }

    //로그인 처리
    public AuthDto.LoginResponse login(AuthDto.LoginRequest req) {

        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        // 비밀번호 검증
        if(!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }

        // JWT발급
        String token = jwtProvider.createAccessToken(user.getId(), user.getRole().name());

        return new AuthDto.LoginResponse(token);
    }
    
}
