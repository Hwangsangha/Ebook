package com.example.ebook.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.ebook.entity.Order;

public class CreatedOrderResponse {
	public Long id;
	public String orderNumber;
	public String status;
	public BigDecimal totalAmount;
	public BigDecimal finalAmount;
	public LocalDateTime createdAt;
	
	public static CreatedOrderResponse from(Order o) {
		CreatedOrderResponse r = new CreatedOrderResponse();
		r.id = o.getId();
		r.orderNumber = o.getOrderNumber();
		r.status = o.getStatus();
		r.totalAmount = o.getTotalAmount();
		r.finalAmount = o.getFinalAmount();
		r.createdAt = o.getCreatedAt();
		return r;
	}
}
