package com.example.ebook.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.ebook.dto.DownloadTokenResponse;
import com.example.ebook.service.DownloadTokenService;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


/*
 * 다운로드 관련 api
 */
@RestController
@RequestMapping("/downloads")
public class DownloadController {

	private final DownloadTokenService downloadTokenService;
	
	public DownloadController(DownloadTokenService downloadTokenService) {
		this.downloadTokenService = downloadTokenService;
	}
	
	//토큰발급: POST /downloads/tokens?userId=1&orderId=2&ebookId=3
	@PostMapping("/tokens")
	@ResponseStatus(HttpStatus.CREATED)
	public DownloadTokenResponse issue(@RequestParam @NotNull Long userId,
										@RequestParam @NotNull Long orderId,
										@RequestParam @NotNull Long ebookId) {
		return downloadTokenService.issue(userId, orderId, ebookId);
	}

	//다운로드: GET /downloads/{token}
	@GetMapping("/{token}")
	public ResponseEntity<byte[]> download(@PathVariable String token) {
		
		//서비스에서 토큰 검증 + 파일 바이트 생성
		var file = downloadTokenService.download(token);
		
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION,
						"attachment; filename=\"" + file.filename() + "\"")
				.contentType(MediaType.APPLICATION_OCTET_STREAM)
				.body(file.bytes());
	}
	
}
