package com.example.ebook.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.example.ebook.common.JwtAuthFilter;
import com.example.ebook.common.JwtProvider;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 비밀번호 암호화/검증용
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    //Security 설정의 핵심 : 어떤  URL을 열고 막을지, 어떤 필터를 끼울지 정의
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                            JwtProvider jwtProvider) throws Exception {
        
        //JWT 방식이므로 세션을 쓰지 않는다
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        //REST API라 보통 CSRF 끔
        http.csrf(csrf -> csrf.disable());

        //H2 콘솔 쓰는 경우 frame 옵션 필요(dev프로필 에서만)
        http.headers(h -> h.frameOptions(f -> f.disable()));

        //URL 별 접근 제어
        http.authorizeHttpRequests(auth -> auth
                //로그인 API는 누구나 접근가능
                .requestMatchers("/auth/**").permitAll()

                //H2 콘솔
                .requestMatchers("/h2-console/**").permitAll()

                //공개 조회는 허용(필요시 조정)
                .requestMatchers(HttpMethod.GET, "/ebooks/**").permitAll()

                //관리자 API는 ADMIN만
                .requestMatchers("/admin/**").hasRole("ADMIN")

                //그 외는 로그인 필요
                .anyRequest().authenticated()
        );

        //JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 끼움
        http.addFilterBefore(new JwtAuthFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);

        //기본 허용 호출
        http.cors(Customizer.withDefaults());

        return http.build();
    }
}
