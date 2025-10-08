package com.example.ebook.dto;

import java.time.LocalDateTime;

//발근된 다운로드 토큰 응답
public class DownloadTokenResponse {
	public final String token;
	public final LocalDateTime expiresAt;
	
	public DownloadTokenResponse(String token, LocalDateTime expiresAt) {
		this.token = token;
		this.expiresAt = expiresAt;
	}
}
