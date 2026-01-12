package com.example.ebook.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDetail {

	public final Long orderId;
	public final String orderNumber;
	public final String status;
	public final BigDecimal totalAmount;
	public final BigDecimal finalAmount;
	public final LocalDateTime createdAt;
	public final List<OrderLine> items;
	
	public OrderDetail(Long orderId, String orderNumber, String status, BigDecimal totalAmount, BigDecimal finalAmount, LocalDateTime createdAt, List<OrderLine> items) {
		this.orderId = orderId;
		this.orderNumber = orderNumber;
		this.status = status;
		this.totalAmount = totalAmount;
		this.finalAmount = finalAmount;
		this.createdAt = createdAt;
		this.items = items;
	}
}
