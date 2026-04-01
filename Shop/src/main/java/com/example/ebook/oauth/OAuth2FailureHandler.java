package com.example.ebook.oauth;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2FailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        //에러메시지 콘솔로 강제 출력
        System.out.println("카카오 로그인 실패 원인" + exception.getMessage());
        exception.printStackTrace();    //상세 로그

        //프론트엔드로 에러 메시지 보내기
        response.sendRedirect("http://localhost:5173/login?error=" + exception.getMessage());
    }
}
