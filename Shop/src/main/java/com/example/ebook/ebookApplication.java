package com.example.ebook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example.ebook")
public class ebookApplication {

	public static void main(String[] args) {
		SpringApplication.run(ebookApplication.class, args);
	}

}
