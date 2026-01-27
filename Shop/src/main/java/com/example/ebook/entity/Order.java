package com.example.ebook.entity;

import java.math.BigDecimal;
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
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/*
 * 주문 
 * status: PENDING/PAID/CANCELLED/REFUNDED
 * 금액은 BigDecimal
 */
@Entity
@Table(
		name = "orders",
		indexes = {@Index(name = "idx_orders_user", columnList = "user_id")},
		uniqueConstraints = {@UniqueConstraint(name = "uq_orders_number", columnNames = "order_number")}
		)
public class Order {

	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "user_id", nullable = false)
	private Long userId;
	
	@Column(name = "order_number", nullable = false, length = 20)
	private String orderNumber;
	
	@Column(nullable = false, length = 20)
	private String status;
	
	@Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
	private BigDecimal totalAmount = BigDecimal.ZERO;
	
	@Column(name = "final_amount", nullable = false, precision = 12, scale = 2)
	private BigDecimal finalAmount = BigDecimal.ZERO;
	
	@Column(name = "paid_at")
	private LocalDateTime paidAt;
	
	@Column(name = "canceled_at")
	private LocalDateTime canceledAt;
	
	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
	
	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<OrderItem> items = new ArrayList<>();
	
	public Order() {}	//JPA 기본 생성자
	
	public Order(Long userId, String orderNumber, String status) {
		this.userId = userId;
		this.orderNumber = orderNumber;
		this.status = status;
	}
	
	//양방향 편의: item.order = this + 리스트 추가
	public void addItem(OrderItem item) {
		if(item == null) return;
		item.setOrder(this);
		this.items.add(item);
	}
	
// ===== getter/setter =====
	public Long getId() { return id; }
	
	public Long getUserId() { return userId; }
	public void setUserId(Long userId) { this.userId = userId; }
	
	public String getOrderNumber() { return orderNumber; }
	public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
	
	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }
	
	public BigDecimal getTotalAmount() { return totalAmount; }
	public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
	
	public BigDecimal getFinalAmount() { return finalAmount; }
	public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }
	
	public LocalDateTime getPaidAt() { return paidAt; }
	public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
	
	public LocalDateTime getCanceledAt() { return canceledAt; }
	public void setCanceledAt(LocalDateTime canceledAt) { this.canceledAt = canceledAt; }
	
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime now) {this.createdAt = now;}
	
	public LocalDateTime getUpdatedAt() { return updatedAt; }
	
	public List<OrderItem> getItems() { return items; }
	public void setItems(List<OrderItem> items) { this.items = items; }

	
}
