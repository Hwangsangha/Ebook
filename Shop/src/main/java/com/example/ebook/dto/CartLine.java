package com.example.ebook.dto;

import java.math.BigDecimal;

/*
 * 장바구니 화면용 DTO
 */
public class CartLine {
	public final Long ebookId;
	public final String title;
	public final BigDecimal price;
	public final int quantity;
	public final BigDecimal subTotal;
	
	public CartLine(Long ebookId, String title, BigDecimal price, int quantity, BigDecimal subTotal) {
		this.ebookId = ebookId;
		this.title = title;
		this.price = price;
		this.quantity = quantity;
		this.subTotal = subTotal;
	}
}
