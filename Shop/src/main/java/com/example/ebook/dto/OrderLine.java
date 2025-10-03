package com.example.ebook.dto;

import java.math.BigDecimal;

public class OrderLine {
	public final Long ebookId;
	public final String title;
	public BigDecimal price;
	public int quantity;
	public final BigDecimal subTotal;
	
	public OrderLine(Long ebookId, String title, BigDecimal price, int quantity, BigDecimal subTotal) {
		this.ebookId = ebookId;
		this.title = title;
		this.price = price;
		this.quantity = quantity;
		this.subTotal = subTotal;
	}
}
