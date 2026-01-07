package com.example.ebook.common;

import java.security.Key;
import java.util.Date;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtProvider {

    //실서비스시 환경변수로 뺴기
    private final Key key = Keys.hmacShaKeyFor(
        "very-secret-key-very-secret-key-very-secret-key".getBytes()
    );

    private final long ACCESS_TOKEN_EXPIRE_MS = 1000L * 60 * 30; // 30분

    //accessToken 생성
    public String createAccessToken(Long userId, String role) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId)) //토큰주인(userId)
                .claim("role", role)    //권한
                .setIssuedAt(new Date())    //발급시각
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRE_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    //토큰에서 Claims 꺼내기 : 검증도 같이 수행
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 토큰 유효성 검사 : true면 유효, false면 무효
    public boolean isValid(String token) {
        try {
            parseClaims(token); //검증 로직을 재사용
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
