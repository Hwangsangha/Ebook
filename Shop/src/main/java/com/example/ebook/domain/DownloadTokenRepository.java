package com.example.ebook.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.ebook.entity.DownloadToken;

import java.time.LocalDateTime;
import java.util.List;


public interface DownloadTokenRepository extends JpaRepository<DownloadToken, Long>{

	//토큰 문자열로 단건조회(다운로드때 검증)
	Optional<DownloadToken> findByToken(String token);
	
	//한 유저가 특정 이북을 발급받은 토큰 이력(최근순 조회에 사용)
	List<DownloadToken> findByUserIdAndEbookIdOrderByIdDesc(Long userId, Long ebookId);
	
	//필요시: 만료 토큰 정리용
	long deleteByExpiresAtBefore(LocalDateTime time);
}
