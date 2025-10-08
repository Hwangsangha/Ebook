package com.example.ebook.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/*결제한 이북 다운로드 토큰
 * token: 고유 문자열(유니크)
 * expiresAt: 만료 시각
 */
@Entity
@Table(name = "download_token",
		uniqueConstraints = {
			@UniqueConstraint(name = "uq_dt_token", columnNames = "token")
		},
		indexes = {
			@Index(name = "idx_dt_user", columnList = "user_id"),
			@Index(name = "idx_dt_ebook", columnList = "ebook_id")
		}
)
public class DownloadToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	
	//토큰 받는 아이디
	@Column(name = "user_id",  nullable = false)
	private Long userId;
	
	//다운받을 이북 아이디
	@Column(name = "ebook_id", nullable = false)
	private Long ebookId;
	
	//실제로 전송할 토큰 문자열
	@Column(name = "token", nullable = false, length = 128)
	private String token;
	
	//토큰 만료시간
	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;
	
	//토큰 생성시간
	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
	
	//--------생성자-----------
	public DownloadToken() {}
	public DownloadToken(Long userId, Long ebookId, String token, LocalDateTime expiresAt) {
		this.userId = userId;
		this.ebookId = ebookId;
		this.token = token;
		this.expiresAt = expiresAt;
	}
	
	//--------------getter/setter--------------
	public Long getId() {return id;}
	
	public Long getUserId() {return userId;}
	public void setUserId(Long userId) {this.userId = userId;}
	
	public Long getEbookId() {return ebookId;}
	public void setEbookId(Long ebookId) {this.ebookId = ebookId;}
	
	public String getToken() {return token;}
	public void setToken(String token) {this.token = token;}
	
	public LocalDateTime getExpiresAt() {return expiresAt;}
	public void setExpiresAt(LocalDateTime expiresAt) {this.expiresAt = expiresAt;}
	
	public LocalDateTime getCreatAt() {return createdAt;}
}
