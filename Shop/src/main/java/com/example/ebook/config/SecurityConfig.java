package com.example.ebook.config;

import com.example.ebook.oauth.OAuth2FailureHandler;
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
import com.example.ebook.oauth.CustomerOAuth2UserService;
import com.example.ebook.oauth.OAuth2SuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2FailureHandler OAuth2FailureHandler;

    SecurityConfig(OAuth2FailureHandler OAuth2FailureHandler) {
        this.OAuth2FailureHandler = OAuth2FailureHandler;
    }

    // 비밀번호 암호화/검증용
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    //Security 설정의 핵심 : 어떤  URL을 열고 막을지, 어떤 필터를 끼울지 정의
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                            JwtProvider jwtProvider,
                                            CustomerOAuth2UserService customerOAuth2UserService,
                                            OAuth2SuccessHandler oAuth2SuccessHandler,
                                            OAuth2FailureHandler oAuth2FailureHandler) throws Exception {
        
        //카카오 로그인 중에만 세션을 쓸수있게 허용
        http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));
        
        //REST API라 보통 CSRF 끔
        http.csrf(csrf -> csrf.disable());

        //H2 콘솔 쓰는 경우 frame 옵션 필요(dev프로필 에서만)
        http.headers(h -> h.frameOptions(f -> f.disable()));

        //URL 별 접근 제어
        http.authorizeHttpRequests(auth -> auth
                //첨부파일
                .requestMatchers("/uploads/**").permitAll()
                
                //주문 관련 허용
                .requestMatchers("/orders/**").permitAll()

                //관리자 API는 ADMIN만
                .requestMatchers("/admin/**").hasRole("ADMIN")

                //로그인 API는 누구나 접근가능
                .requestMatchers("/auth/**").permitAll()

                //카카오 로그인 접근
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                //H2 콘솔
                .requestMatchers("/h2-console/**").permitAll()

                //공개 조회는 허용(필요시 조정)
                .requestMatchers(HttpMethod.GET, "/api/ebooks/**").permitAll()

                //다운로드 경로(URL에 토큰)
                .requestMatchers("/downloads/**").permitAll()

                //테스트용 환불 허용
                .requestMatchers("/payments/*/cancel").permitAll()

                //백엔드 내부에서 튕겼을때 무한 루프를 막기 위해 허용
                .requestMatchers("/error").permitAll()

                //그 외는 로그인 필요
                .anyRequest().authenticated()
        );

        //소셜 로그인 
        http.oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customerOAuth2UserService) //카카오 데이터 전환
                )
                .successHandler(oAuth2SuccessHandler)   //성공시 JWT 발급해서 React로 넘김
                .failureHandler(OAuth2FailureHandler)   //실패 탐지기
        );

        //JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 끼움
        http.addFilterBefore(new JwtAuthFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);

        //기본 허용 호출
        http.cors(Customizer.withDefaults());

        return http.build();
    }
}
