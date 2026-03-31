package com.example.ebook.oauth;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.example.ebook.domain.UserRepository;
import com.example.ebook.entity.User;
import com.example.ebook.entity.User.Role;

@Service
public class CustomerOAuth2UserService extends DefaultOAuth2UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerOAuth2UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        //기본 OAuth2UserService를 통해 카카오에서 유저정보를 가져옴
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        //디버깅
        System.out.println("=====카카오가 준 데이터=====");
        System.out.println(attributes);

        //카카오 데이터 구조에서 닉네임과 이메일 가져오기
        //카카오는 kakao_account 안에 email과 profile이 숨어있음
        Map<String, Object> properties = (Map<String, Object>) attributes.get("profile");
        String name = "카카오유저";

        if(properties != null && properties.get("nickname") != null) {
            name = (String) properties.get("nickname");
        }

        //이메일 대신 카카오 고유 ID를 받아서 식별 이메일로 조립
        Long providerId = ((Number) attributes.get("id")).longValue();
        String email = "kakao_" + providerId + "@ebook.com";

        //DB에 카카오 이메일로 가입된 유저가 있는지 확인
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if(userOptional.isPresent()) {
            //이미 가입된 회원이면 정보만 업데이트
            user = userOptional.get();
            user.setName(name);     //닉네임이 바뀌었을 수도 있으니 갱신
            userRepository.save(user);
        } else {
            //첫 로그인이면 강제 회원가입
            //비밀번호는 UUID로 암호화
            String dummyPassword = passwordEncoder.encode(UUID.randomUUID().toString());

            user = User.builder()
                    .email(email)
                    .name(name)
                    .password(dummyPassword)
                    .role(Role.USER)    //기본 권한은 USER
                    .build();
            userRepository.save(user);
        }

        //Spring Security에 보낼 형태로 변환
        return new DefaultOAuth2User(
            Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
            attributes,
            "id"        //카카오 식별자 키 이름
        );
    }
}
