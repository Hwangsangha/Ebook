package com.example.ebook.common;

import java.security.Key;
import java.util.Date;
import org.springframework.stereotype.Component;
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
}
