package com.example.ebook.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebCorsConfig implements WebMvcConfigurer{

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")					//모든 API경로 허옹
				.allowedOrigins(
						"http://localhost:3000",	//React
						"http://localhost:5173")	// Vite
				.allowedMethods("GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.exposedHeaders("Authorization")
				.allowCredentials(true)			//쿠키/인증정보 필요 없으면 false
				.maxAge(3600);						//preflight 캐시(초)
		
	}
}
