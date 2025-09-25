package com.example.ebook.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/*
 * 장바구니(유저당 1개)
 * userId: 아직 인증을 안 붙였으니 Long으로만 보관
 * updatedAt: 장바구니 변경 시작
 */
@Entity
@Table(name = "cart", uniqueConstraints = {
		@UniqueConstraint(name = "uq_cart_user", columnNames = {"user_id"})
})
public class Cart {

	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "user_id", nullable = false)
	private Long userId;
	
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
//----------------------------------생성자---------------------------------	
	protected Cart() {}
	public Cart(Long userId) {
		this.userId = userId;
		this.updatedAt = LocalDateTime.now();
	}
	
// --------------------------------도메인 동작------------------------------
    //장바구니가 변경될 때 갱신 시간만 업데이트
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }
	
//-------------------------------getter/setter-------------------------------
	public Long getId() {return id;}
	public Long getUserId() {return userId;}
	public void serUserId(Long userId) {this.userId = userId;}
	public LocalDateTime getUpdatedAt() {return updatedAt;}
	public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
}
