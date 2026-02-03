package com.example.ebook.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebResourceConfig implements WebMvcConfigurer {
    
    @Value("${ebook.storage.path}")
	private String storagePath;		//C/kdt/github/Shop/Shop

    @Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resourceLocation = "file:///" + storagePath + "/";

		registry.addResourceHandler("/uploads/**")
				.addResourceLocations(resourceLocation);
	}
}
