package com.example.ebook.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
	
	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
	
	@OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<CartItem> items = new ArrayList<>();
//----------------------------------생성자---------------------------------	
	//편의 생성자
	public Cart(Long userId) {
		this.userId = userId;
		this.updatedAt = LocalDateTime.now();
	}
	//JPA기본 생성자
	public Cart() {}
	
// --------------------------------도메인 동작------------------------------
    //장바구니가 변경될 때 갱신 시간만 업데이트
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }
    
    //장바구니 여러개 담기
    public void addItem(CartItem item) {
		this.items.add(item);
		item.setCart(this);
		touch();
	}
    
    //장바구니 항목 삭제
    public void removeItem(CartItem item) {
    	this.items.remove(item);
    	item.setCart(null);
    	touch();
    }
    
    //장바구니 비우기
    public void clearItems() {
    	for(CartItem item : items) {
    		item.setCart(null);
    	}
    	this.items.clear();
    	touch();
    }
	
//-------------------------------getter/setter-------------------------------
	public Long getId() {return id;}
	public Long getUserId() {return userId;}
	public void serUserId(Long userId) {this.userId = userId;}
	public LocalDateTime getCreatedAt() {return createdAt;}
	public LocalDateTime getUpdatedAt() {return updatedAt;}
	public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
	public List<CartItem> getItems(){return items;}

	
	
}
