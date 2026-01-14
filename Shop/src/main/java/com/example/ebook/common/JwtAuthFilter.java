package com.example.ebook.common;

import java.io.IOException;
import org.springframework.http.HttpHeaders;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtAuthFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // Authorization 헤더에서 토큰 추출
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Bearer 토큰이 아니면 그냥 통과(익명 요청으로 처리)
        if(authHeader == null || !authHeader.startsWith("Bearer")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = authHeader.substring(7); //"Bearer" 이후만

        // 토큰 검증
        if(!jwtProvider.isValid(token)) {
            // 유효하지 않으면 인증정보를 넣지 않고 통과
            // SecurityConfig에서 보호된 API는 결국 401/403 처리됨
            filterChain.doFilter(request, response);
            return;
        }

        //토큰에서 userId/role 꺼내기
        Claims claims = jwtProvider.parseClaims(token);
        String userId = claims.getSubject();    //createAccessToken에서 subject에 넣은 값
        String role = (String)claims.get("role", String.class);   //ADMIN / USER

        //Spring Security가 이해하는 권한 문자열로 변환
        //Spring Security는 보통 ROLE_ 접두사를 기대
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

        //인증 객체 생성해서 SecurityContext에 저장
        //principal: userId(문자열)로 넣음 (나중에 컨트롤러에서 꺼낼 수 있음)
        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userId, null, List.of(authority));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        //다음 필터로 진행
        filterChain.doFilter(request, response);
    }

}
