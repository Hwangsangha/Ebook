package com.example.ebook.oauth;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.ebook.common.JwtProvider;
import com.example.ebook.domain.UserRepository;
import com.example.ebook.entity.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    public OAuth2SuccessHandler(JwtProvider jwtProvider, UserRepository userRepository) {
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
    }

    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
    
        //카카오 유저 정보에서 이메일 가져오기
        Map<String, Object> attributes = oAuth2User.getAttributes();

        //카카오 고유ID로 가짜 이메일 유추
        Long providerId = ((Number) attributes.get("id")).longValue();
        String email = "kakao_" + providerId + "@ebook.com";

        //권한 가져오기
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        //이메일로 DB를 조회해서 userId 가져오기
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("카카오 유저를 찾을 수 없습니다."));
        
        //userId 토큰 발금
        String token = jwtProvider.createAccessToken(user.getId(), role);

        //react특정 페이지로 토큰 리다이렉트
        String targetUrl = "http://localhost:5173/oauth2/redirect?token=" + token;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
